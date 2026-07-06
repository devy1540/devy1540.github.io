---
title: "서비스 국제화 적용기 (4) - 백엔드가 할 몫: 사용자 언어·시간대와 문서 로케일"
date: "2026-06-26"
description: "프론트만 번역하면 서버가 한국어 응답·문서로 다시 한국어를 섞는다. 백엔드가 사용자 언어·시간대를 저장하고, 인증 컨텍스트로 들고 다니며, 응답과 문서까지 로케일을 흘려보낸 이야기."
tags: ["i18n", "spring-boot", "java", "backend"]
series: "서비스 국제화 적용기"
seriesOrder: 4
draft: true
---

## 배경

앞의 세 편은 프론트엔드 이야기였다. 하지만 프론트에서 문구를 아무리 잘 번역해도, 서버가 한국어 에러 메시지를 내려주거나 한국어로 된 PDF 문서를 발급하면 화면에는 다시 한국어가 섞인다. 국제화는 프론트만의 일이 아니라, **백엔드도 "이 사용자가 어떤 언어인지"를 알고 응답·문서에 반영해야** 완성된다.

## 사용자 언어·시간대를 저장한다

먼저 사용자가 언어와 시간대를 고르고 저장할 수 있어야 했다. 로케일 설정 API를 하나 뒀다.

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

요청·응답은 언어 코드와 시간대 코드를 함께 담는다.

```java
public record UpdateUserLocaleRequest(String timezoneCode, String languageCode) {}
public record UserLocaleResponse(String timezoneCode, String languageCode) {}
```

언어 값은 문자열을 아무거나 받지 않고 `Language` enum으로 정규화한다. 표시명·간단코드·표준 언어코드를 한 enum이 함께 들고 있어, 어디서 변환해도 기준이 하나다.

```java
public enum Language {
    KOREAN("한국어", "KR", "ko"),
    ENGLISH("영어", "EN", "en"),
    JAPANESE("일본어", "JP", "ja"),
    // ...
    private final String code;         // 표시명
    private final String simpleCode;   // KR / EN / JP
    private final String languageCode; // ko / en / ja (표준)
}
```

## 인증 principal이 언어를 들고 다닌다

언어를 저장했으면, 매 요청마다 DB를 다시 뒤질 게 아니라 **인증 컨텍스트가 언어를 들고 다니게** 했다. 인증 principal(`AuthenticatedUserDto`)에 언어 코드를 실었다.

```java
public class AuthenticatedUserDto {
    private Language lang;
    private String languageCode;   // 미설정이면 "system"
    // ...
}
```

이제 어떤 서비스든 `@AuthenticationPrincipal`로 받은 사용자에서 곧바로 언어를 알 수 있다. 값이 없으면 `"system"`으로 두고, 실제 로케일은 프론트와 같은 규칙(시스템 언어 → 미지원 시 en)으로 해석한다.

## 응답과 문서까지 로케일을 흘려보낸다

사용자 언어를 알게 됐으니, 이제 그걸 실제 출력에 반영한다.

- **API 응답** - 1편에서 프론트가 실어 보낸 `Accept-Language`를 서버가 읽어 같은 언어로 응답한다
- **발급 문서** - 수강확인증·레벨테스트 리포트처럼 PDF로 나가는 문서에도 언어를 전파한다. 예를 들어 레벨테스트 리포트 링크에는 `?lang=`으로 언어를 붙이고, 수강확인증 발급 요청 페이로드에도 언어 값을 실어 보낸다

```java
// 레벨테스트 리포트 링크에 언어 전파
extras.put("reportLink", appUrl + "/level-test/report?lang=" + dto.getLanguage());
```

문서는 한 번 발급되면 그대로 사용자 손에 남기 때문에, "화면은 일본어인데 발급된 PDF는 한국어" 같은 어긋남이 특히 눈에 띈다. 그래서 발급 경로마다 언어를 빠짐없이 실어 보내는 게 중요했다.

## 시간은 UTC로 통일

로케일에는 언어뿐 아니라 시간대도 걸려 있다. 그동안 서버가 KST 기준으로 동작하던 부분이 있었는데, 해외 사용자가 들어오면 예약·수업 시간이 어긋나기 시작한다. 그래서 저장·연산은 **UTC 기준으로 통일**하고, 시간대 변환은 표시 계층(사용자 `timezoneCode`)에서만 하도록 정리했다. 시차 버그는 대개 "어디선가 로컬 시간으로 계산"에서 나오는데, 기준을 UTC 한 곳으로 모으니 그런 함정이 줄었다.

## 마치며

이제 백엔드도 사용자 언어를 알고, API 응답과 발급 문서 경로에 로케일을 실어 보낸다. 그런데 정작 그 **문서 자체는 어떻게 다국어로 렌더링**할까? 수강확인증·리포트는 오랫동안 언어가 이미지에 박혀 있어서, 영어·일본어판을 만들려면 배경 이미지를 다시 그려야 했다. 마지막 편에서 이미지로 박아두던 문서를 HTML 렌더링으로 옮겨 다국어를 지원한 이야기를 다룬다.
