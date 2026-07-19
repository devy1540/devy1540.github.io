---
title: "Splitting Login Responsibility (3) - Verifying Old Tokens and New Backend Tokens Together"
date: "2026-04-17"
updated: "2026-04-17"
description: "How I split verification order and failure handling when old frontend tokens and new backend-issued tokens had to be accepted through the same browser cookies."
tags: ["authentication", "oauth", "jwt", "testing", "migration", "java", "spring"]
series: "Splitting Login Responsibility"
seriesOrder: 3
draft: false
---

## Background

Moving authentication responsibility to the backend does not make existing login tokens disappear all at once.

There are already logged-in users. Tokens issued by the frontend remain in browser cookies. Some APIs still read tokens from those cookies. At the same time, users entering through the new login flow receive backend-issued tokens under the same cookie names.

For a while, two token issuance paths exist together.

1. Requests with old tokens should be handled by the legacy verification path.
2. Requests from the new login flow should be handled according to backend token rules.

This post summarizes how I split the verification order and redirect checks in that situation.

---

## Legacy tokens were not verified by signature alone

The old frontend token was a JWT, but a valid JWT signature was not enough.

When the token was created, it was also stored in Redis. Verification checked both values.

```ts
async function verifyLegacyToken(token: string) {
  const [storedUserId, payload] = await Promise.all([
    redis.get(token),
    jwt.verify(token),
  ])

  if (!storedUserId || storedUserId !== payload.sub) {
    throw new UnauthorizedError()
  }

  return payload
}
```

In this structure, the token string itself acts as a Redis key. When the user logs out, the token is removed from Redis. Even if the same JWT comes in later, it is no longer valid.

So when handling a legacy token read from a cookie, the frontend must not simply decode it or verify its signature. Legacy tokens must be verified in the legacy way.

---

## Backend tokens are checked with the backend

The frontend did not interpret tokens from the new authentication flow directly.

The backend decides whether a backend token is valid. The frontend calls an introspection-like API and checks only whether the token is active and which user it represents.

```ts
async function verifyBackendToken(token: string, refreshToken?: string) {
  const introspection = await authApi.introspect(token)

  if (introspection.active && introspection.sub) {
    return toSessionPayload(introspection)
  }

  if (!refreshToken) {
    throw new UnauthorizedError()
  }

  const refreshed = await authApi.refresh(refreshToken)
  const refreshedInfo = await authApi.introspect(refreshed.accessToken)

  if (!refreshedInfo.active || !refreshedInfo.sub) {
    throw new UnauthorizedError()
  }

  return {
    payload: toSessionPayload(refreshedInfo),
    accessToken: refreshed.accessToken,
    refreshToken: refreshed.refreshToken,
  }
}
```

This lets the frontend avoid knowing the backend token's signing method or storage model. Whether an expired access token can be refreshed with a refresh token also follows the backend response.

---

## Backend introspection hides token meaning

If the frontend should not decode backend tokens directly, the backend needs a token verification API.

The important part is keeping the response small. The frontend only needs to know whether the token is active and which user it can be mapped to. The signing method, key rotation, and storage model are backend internals.

```java
@PostMapping("/introspect")
public Map<String, Object> introspect(@RequestBody TokenRequest request) {
    if (!StringUtils.hasText(request.token())) {
        return Map.of("active", false);
    }

    try {
        Jwt jwt = jwtDecoder.decode(request.token());
        boolean active = jwt.getExpiresAt() == null
            || jwt.getExpiresAt().isAfter(Instant.now());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("active", active);

        if (jwt.getSubject() != null) {
            response.put("sub", jwt.getSubject());
        }
        if (jwt.getIssuedAt() != null) {
            response.put("iat", jwt.getIssuedAt().getEpochSecond());
        }
        if (jwt.getExpiresAt() != null) {
            response.put("exp", jwt.getExpiresAt().getEpochSecond());
        }

        return response;
    } catch (JwtException e) {
        return Map.of("active", false);
    }
}
```

With this API, the frontend does not need to know the internal structure of backend tokens. Failures can also be normalized to `active: false` instead of exposing exceptions directly.

---

## The refresh token source of truth is Redis

Access tokens expire quickly. Refresh tokens are used to issue new access tokens. I did not treat refresh tokens as JWTs that can be interpreted by themselves. Instead, their state was checked in Redis.

```java
@PostMapping("/refresh")
public TokenResponse refresh(@RequestBody RefreshRequest request) {
    String refreshToken = request.refreshToken();
    String userId = refreshTokenStore.resolve(refreshToken);

    if (!StringUtils.hasText(userId)) {
        throw new UnauthorizedException();
    }

    refreshTokenStore.touch(refreshToken);
    return tokenService.issueAccessToken(userId, refreshToken);
}
```

The store has a simple role: store on issuance, resolve on refresh, and delete on logout or expiration handling.

```java
@Service
class RefreshTokenStore {
    private static final String KEY_PREFIX = "auth:refresh:";

    public String issue(String userId) {
        String token = generateToken();
        redis.opsForValue().set(key(token), userId, refreshTtl);
        return token;
    }

    public String resolve(String token) {
        return redis.opsForValue().get(key(token));
    }

    public void touch(String token) {
        redis.expire(key(token), refreshTtl);
    }

    public void revoke(String token) {
        redis.delete(key(token));
    }

    private String key(String token) {
        return KEY_PREFIX + token;
    }
}
```

The refresh token is sent through a browser cookie, but cookie presence is not the source of validity. It must still exist in Redis and be connected to the stored user. So deleting a token is not the same as clearing a browser cookie. The server-side store must also prevent further refresh.

---

## Decide which token to verify first

While both token types have to be accepted, the verification order must be explicit.

```ts
async function verifyToken(accessToken: string, refreshToken?: string) {
  try {
    return await verifyLegacyTokenWithRefresh(accessToken, refreshToken)
  } catch {
    return await verifyBackendTokenWithRefresh(accessToken, refreshToken)
  }
}
```

The order matters.

Checking legacy tokens first makes it easier to preserve existing user sessions. New tokens fail the legacy verification path and then move to backend verification.

But this structure should not live forever. It is a compatibility layer for accepting legacy tokens during the migration. Once the new authentication flow is stable enough, the legacy token verification path should be removed. Otherwise, the frontend must keep understanding two authentication systems.

---

## On page flow failure, delete token cookies and send the user to the auth entry point

When token verification fails, the most important thing is to avoid leaving an ambiguous state. The API verification layer deletes token cookies and returns an error, while page middleware observes that failure and sends the user to the authentication entry point.

```ts
async function authMiddleware(request: Request) {
  const accessToken = getCookie(request, "accessToken")
  const refreshToken = getCookie(request, "refreshToken")

  if (!accessToken) {
    return redirectToAuthorize(request)
  }

  try {
    const result = await verifyToken(accessToken, refreshToken)
    return continueWithSession(request, result)
  } catch {
    const response = redirectToAuthorize(request)
    deleteCookie(response, "accessToken")
    deleteCookie(response, "refreshToken")
    return response
  }
}
```

If verification fails but token cookies remain, the next request repeats the same failure. The user can bounce between the login page and the protected page, or see a page that loads while its APIs return only 401 responses.

So on failure, I deleted token cookies and sent the user to the same authentication entry point.

---

## Verify the redirect chain

The most important verification in this work was not a unit test. It was checking the redirect chain.

Even if the code says it redirects to the authentication entry point, the actual response might still fall into the old login page or another route. An authentication flow is completed as the browser follows several responses.

The expected flow is simple.

```text
Protected page
-> Frontend authorize
-> Backend authorize
-> Login or identity provider
-> Backend callback
-> Frontend callback
-> Original page
```

Locally, I used `curl -I` to check the first redirect location, and when necessary, I inspected actual cookies and Location headers in the browser.

```bash
curl -I http://localhost:3000/protected
```

The protected page should not fall directly into a login screen. It should move to the frontend authentication start route, and that route should redirect again to backend authorize.

---

## What I Tested

Where the two verification paths meet, I tested these cases.

| Case | Expected Result |
|------|-----------------|
| Legacy access token valid | Legacy verification succeeds, backend verification is not called |
| Legacy access token expired, legacy refresh token valid | Access token is reissued with legacy refresh |
| Legacy token verification fails, backend access token valid | Backend verification succeeds |
| Backend access token inactive, refresh token valid | Backend refresh succeeds and new token is stored |

The purpose of these tests was not to check whether "login works." It was to check which verification path was used.

If legacy verification succeeds, backend introspection must not be called. If the backend access token is valid, the refresh API must not be called. The call order has to be correct before code that keeps both verification paths can be trusted.

---

## Summary

The hard part was not creating the new flow. It was accepting existing tokens and new backend tokens together for a while.

Legacy tokens must be verified in the legacy way. Backend tokens must be checked with the backend. On failure, token cookies should be cleared, and every unauthenticated entry should go through the same authentication entry point.

And at the end, the redirect chain must be verified.

Authentication is not the result of one function. It is a flow composed of multiple HTTP responses. Even if tests pass, the migration is not complete if the real browser still follows the old login route.
