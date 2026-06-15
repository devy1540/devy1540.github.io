---
title: "로그인 책임 분리 (3) - 기존 토큰과 새 백엔드 토큰을 함께 검증하기"
date: "2026-04-17"
description: "브라우저에는 토큰이 쿠키로 전달되지만, 기존 토큰과 새 백엔드 토큰의 검증 기준이 다를 때 순서와 실패 처리를 어떻게 나눴는지 정리합니다."
tags: ["authentication", "oauth", "jwt", "testing", "migration"]
series: "로그인 책임 분리"
seriesOrder: 3
draft: true
---

## 배경

인증 책임을 백엔드로 옮긴다고 해서 기존 로그인 토큰이 한 번에 사라지지는 않는다.

이미 로그인한 사용자가 있고, 프론트엔드가 발급한 토큰이 브라우저 쿠키에 남아 있고, 일부 API는 여전히 그 쿠키에서 토큰을 읽는다. 동시에 새 로그인 흐름으로 들어온 사용자는 백엔드가 발급한 토큰을 같은 쿠키 이름으로 받게 된다.

즉 한동안은 두 종류의 토큰 발급 경로가 같이 존재한다.

1. 기존 토큰을 가진 요청은 기존 검증 경로로 처리한다.
2. 새 로그인 흐름으로 들어온 요청은 백엔드 토큰 기준으로 처리한다.

이 글은 이 상황에서 검증 순서와 redirect 확인을 어떻게 나눴는지에 대한 정리다.

---

## 기존 토큰은 서명만으로 검증되지 않았다

기존 프론트엔드 토큰은 JWT였지만, JWT 서명만 맞으면 끝나는 구조가 아니었다.

토큰을 만들 때 Redis에도 저장했고, 검증할 때는 두 가지를 함께 확인했다.

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

이 구조에서는 토큰 문자열 자체가 Redis key 역할을 한다. 로그아웃하면 Redis에서 토큰을 지우고, 이후 같은 JWT가 들어와도 유효하지 않다.

따라서 쿠키에서 읽은 기존 토큰을 처리할 때도 토큰을 단순히 decode하거나 서명만 확인하면 안 된다. 기존 토큰은 기존 방식으로 검증해야 한다.

---

## 백엔드 토큰은 백엔드에 물어본다

새로운 인증 흐름에서 받은 토큰은 프론트엔드가 직접 해석하지 않았다.

백엔드 토큰이 유효한지는 백엔드가 판단한다. 프론트엔드는 introspection 성격의 API를 호출해 active 여부와 사용자 식별자만 확인한다.

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

이렇게 하면 프론트엔드는 백엔드 토큰의 서명 방식이나 저장 방식을 몰라도 된다. access token이 만료됐을 때 refresh token으로 갱신할 수 있는지도 백엔드 응답에 따른다.

---

## 어떤 토큰부터 확인할지 정한다

두 종류의 토큰을 함께 받아야 하는 동안에는 검증 순서를 명확히 정해야 한다.

```ts
async function verifyToken(accessToken: string, refreshToken?: string) {
  try {
    return await verifyLegacyTokenWithRefresh(accessToken, refreshToken)
  } catch {
    return await verifyBackendTokenWithRefresh(accessToken, refreshToken)
  }
}
```

여기서 순서는 중요하다.

기존 토큰을 먼저 검증하면 기존 사용자의 세션을 유지하기 쉽다. 새 토큰은 기존 검증에서 실패한 뒤 백엔드 검증으로 넘어간다.

다만 이 방식은 오래 유지할 구조가 아니다. 기존 토큰을 새 인증 흐름과 함께 처리하기 위한 호환 레이어다. 새 인증 흐름이 충분히 안정화되면 기존 토큰 검증 경로는 제거해야 한다. 그렇지 않으면 프론트엔드는 계속 두 인증 체계를 알고 있어야 한다.

---

## 페이지 흐름에서는 실패하면 토큰 쿠키를 지우고 인증 시작점으로 보낸다

토큰 검증이 실패했을 때 가장 중요한 것은 애매한 상태를 남기지 않는 것이다. API 검증 계층에서는 토큰 쿠키를 지우고 오류를 반환하고, 페이지 미들웨어는 그 실패 응답을 보고 인증 시작점으로 보낸다.

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

검증이 실패했는데 토큰 쿠키를 그대로 두면 다음 요청에서도 같은 실패가 반복된다. 사용자는 로그인 페이지와 보호 페이지 사이를 계속 오가거나, 화면은 열렸는데 API만 401이 나는 상태를 만날 수 있다.

그래서 실패 시에는 토큰 쿠키를 지우고, 같은 인증 시작점으로 보냈다.

---

## redirect chain을 검증해야 한다

이 작업에서 가장 중요한 검증은 단위 테스트보다 redirect chain 확인이었다.

코드상으로는 인증 시작점으로 redirect한다고 작성했더라도, 실제 응답이 예전 로그인 페이지나 다른 경로로 떨어질 수 있다. 인증 흐름은 브라우저가 여러 응답을 따라가며 완성되기 때문이다.

확인해야 할 흐름은 단순하다.

```text
보호 페이지
-> 프론트엔드 authorize
-> 백엔드 authorize
-> 로그인 또는 인증 제공자
-> 백엔드 callback
-> 프론트엔드 callback
-> 원래 페이지
```

로컬에서는 `curl -I`로 첫 redirect 위치를 확인하고, 필요하면 브라우저에서 실제 쿠키와 Location 헤더를 함께 봤다.

```bash
curl -I http://localhost:3000/protected
```

기대하는 것은 보호 페이지가 로그인 화면으로 바로 떨어지는 것이 아니다. 프론트엔드 인증 시작 라우트로 이동하고, 그 라우트가 다시 백엔드 authorize로 이동해야 한다.

---

## 테스트로 잡은 것

두 검증 경로가 섞이는 부분에서는 실제로 다음 케이스를 테스트했다.

| 케이스 | 기대 결과 |
|--------|-----------|
| 기존 access token 유효 | 기존 검증 성공, 백엔드 검증 호출 없음 |
| 기존 access token 만료, 기존 refresh token 유효 | 기존 refresh로 access token 재발급 |
| 기존 토큰 검증 실패, 백엔드 access token 유효 | 백엔드 검증 성공 |
| 백엔드 access token 비활성, refresh token 유효 | 백엔드 refresh 후 새 토큰 저장 |

이 테스트의 목적은 "로그인이 된다"를 확인하는 것이 아니다. 어떤 검증 경로를 탔는지 확인하는 것이다.

기존 검증이 성공했다면 백엔드 introspection이 호출되면 안 된다. 백엔드 access token이 유효하다면 refresh API가 호출되면 안 된다. 이런 호출 순서가 맞아야 두 검증 경로를 함께 둔 코드를 신뢰할 수 있다.

---

## 정리

어려운 부분은 새 흐름을 만드는 것보다 기존 토큰과 새 백엔드 토큰을 한동안 함께 받아야 하는 쪽이었다.

기존 토큰은 기존 방식으로 검증해야 하고, 백엔드 토큰은 백엔드에 물어봐야 한다. 실패하면 토큰 쿠키를 정리하고, 모든 미인증 진입은 같은 인증 시작점으로 보내야 한다.

그리고 마지막에는 반드시 redirect chain을 확인해야 한다.

인증은 함수 하나의 결과가 아니라 여러 HTTP 응답이 이어진 흐름이다. 테스트가 통과해도 실제 브라우저가 예전 로그인 경로를 타고 있으면 전환은 끝난 게 아니다.
