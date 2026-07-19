---
title: "Service Internationalization (4) - The Backend's Part: User Language, Timezone, and Document Locale"
date: "2026-06-26"
updated: "2026-06-26"
description: "Translate the front end alone and the server keeps mixing Korean back in through its responses and documents. This is the story of how the backend stored each user's language and timezone, carried them along in the authentication context, and pushed the locale all the way through to responses and documents."
tags: ["i18n", "spring-boot", "java", "backend"]
series: "Service Internationalization"
seriesOrder: 4
draft: false
---

## Background

The previous three posts were about the front end. But no matter how well the front end translates the copy, if the server sends back Korean error messages or issues Korean PDF documents, Korean creeps right back onto the screen. Internationalization isn't only a front-end job — it's finished only when **the backend, too, knows "what language this user speaks" and reflects it in responses and documents**.

## Store the user's language and timezone

First, users had to be able to pick and save a language and a timezone. So I set up a single locale settings API.

```java
@PatchMapping("/user/locale")
public ResponseEntity<ApiResponse<UserLocaleResponse>> updateUserLocale(
        @AuthenticationPrincipal AuthenticatedUserDto user,
        @RequestBody @Valid UpdateUserLocaleRequest request
) {
    UserLocaleResponse result = userInfoService.updateUserLocale(
            user.getId(), request.timezoneCode(), request.languageCode());
    return ResponseEntity.ok(ApiResponse.success(result));
}
```

The request and response carry a language code and a timezone code together.

```java
public record UpdateUserLocaleRequest(String timezoneCode, String languageCode) {}
public record UserLocaleResponse(String timezoneCode, String languageCode) {}
```

The language value isn't accepted as an arbitrary string; it's normalized into a `Language` enum. A single enum holds the display name, the simple code, and the standard language code together, so wherever a conversion happens, there's just one source of truth.

```java
public enum Language {
    KOREAN("한국어", "KR", "ko"),
    ENGLISH("영어", "EN", "en"),
    JAPANESE("일본어", "JP", "ja"),
    // ...
    private final String code;         // display name
    private final String simpleCode;   // KR / EN / JP
    private final String languageCode; // ko / en / ja (standard)
}
```

## The authentication principal carries the language

Once the language was stored, rather than digging through the DB again on every request, I had the **authentication context carry the language along**. I loaded the language code onto the authentication principal (`AuthenticatedUserDto`).

```java
public class AuthenticatedUserDto {
    private Language lang;
    private String languageCode;   // "system" if not set
    // ...
}
```

Now any service can read the language straight from the user it received via `@AuthenticationPrincipal`. When there's no value, it's left as `"system"`, and the actual locale is resolved by the same rule as the front end (system language → en when unsupported).

## Push the locale through to responses and documents

Now that we know the user's language, we reflect it in the actual output.

- **API responses** - the server reads the `Accept-Language` header the front end sent in Part 1, and responds in the same language
- **Issued documents** - for documents that go out as PDFs, such as enrollment certificates and level test reports, we propagate the language too. For example, the level test report link gets the language appended via `?lang=`, and the enrollment certificate issuance request payload also carries the language value

```java
// propagate the language into the level test report link
extras.put("reportLink", appUrl + "/level-test/report?lang=" + dto.getLanguage());
```

Because a document, once issued, stays in the user's hands as is, a mismatch like "the screen is in Japanese but the issued PDF is in Korean" stands out especially. That's why it was important to carry the language along every issuance path without exception.

## Standardize time on UTC

A locale carries not just language but also a timezone. Until then, parts of the server ran on KST, and once overseas users came in, reservation and class times started to drift. So I standardized **storage and computation on UTC**, and reorganized things so that timezone conversion happens only in the display layer (the user's `timezoneCode`). Time-difference bugs usually come from "computing in local time somewhere," so gathering the baseline into a single place — UTC — reduced those traps.

## Wrap-up

Now the backend knows the user's language too, and carries the locale along the API response and issued-document paths. But then — how do we actually render **the documents themselves** in multiple languages? For a long time, enrollment certificates and reports had their text baked into images, so building English and Japanese versions meant redrawing the background image. In the final post, I'll cover the story of moving documents that used to be baked into images over to HTML rendering to support multiple languages.
