---
title: "서비스 국제화 적용기 (3) - GrowthBook 킬스위치로 무중단 점진 롤아웃"
date: "2026-06-17"
description: "번역을 다 만들었어도 전원에게 한 번에 켜면 위험하다. 로케일 결정을 단일 차단점으로 모으고, GrowthBook 킬스위치로 i18n을 무중단·점진 롤아웃한 이야기."
tags: ["i18n", "nextjs", "growthbook", "feature-flag"]
series: "서비스 국제화 적용기"
seriesOrder: 3
draft: true
---

## 배경

1·2편에서 문구를 메시지 카탈로그로 옮기고, 언어팩을 GCS에서 서빙하는 것까지 만들었다. 그럼 이제 전 사용자에게 켜면 될까? 아니다. i18n을 한 번에 전면 오픈하는 건 위험하다.

- 번역이 빠진 화면이 어딘가 남아 한국어가 튀어나올 수 있고
- 일본어·영어는 같은 문장도 길이가 달라 레이아웃이 깨질 수 있고
- 번역 자체가 어색하거나 틀린 곳이 뒤늦게 발견될 수 있다

그래서 목표는 하나였다. **점진적으로 켜되, 문제가 생기면 배포 없이 즉시 되돌린다.** 그 장치가 GrowthBook 킬스위치다.

## 로케일 결정을 한 곳으로: 단일 차단점

킬스위치가 제대로 동작하려면, "이 요청의 로케일은 무엇인가"를 결정하는 지점이 **딱 한 곳**이어야 한다. 여기저기서 각자 로케일을 정하면, 킬스위치를 꺼도 어딘가는 여전히 일본어로 나온다.

그래서 `resolveEffectiveLocale` 하나로 결정을 모으고, 여기에 플래그(`i18nEnabled`)를 주입했다.

```ts
export const resolveEffectiveLocale = ({
  languageCode, systemLocale, acceptLanguage, i18nEnabled = true,
}: ResolveArgs): Locale => {
  // i18n 킬스위치 - off면 이유불문 ko. 로케일 결정의 단일 차단점.
  if (!i18nEnabled) return 'ko'

  const code = normalizeLanguageCode(languageCode)
  if (code !== 'system') return code

  return normalizeLocale(systemLocale)
    ?? resolveLocaleFromAcceptLanguage(acceptLanguage)
    ?? FALLBACK_LOCALE
}
```

플래그가 꺼지면 사용자 설정이 `en`이든 `ja`든, 시스템 언어가 뭐든 **무조건 한국어로 떨어진다.** 로케일이 흘러갈 수 있는 유일한 문(門)에 스위치를 단 셈이다. 플래그 값은 GrowthBook에서 `i18n_enabled` 하나로 관리한다.

## 서버와 클라이언트가 같은 결정을 하게

Next.js App Router라 로케일은 서버(레이아웃)와 클라이언트(프로바이더) 양쪽에서 쓰인다. 두 곳이 서로 다른 로케일을 고르면 hydration이 깨진다. 그래서 **둘 다 같은 `resolveEffectiveLocale`에 같은 플래그를 먹인다.**

```tsx
// 서버: 레이아웃에서 플래그를 읽어 내려줌
const i18nEnabled = flagResult.values[FEATURE_FLAG_KEYS.I18N_ENABLED]?.enabled ?? false
// ...
<I18nProvider i18nEnabled={i18nEnabled} /* ... */>
```

서버는 플래그를 읽어 `html lang`과 첫 렌더를 정하고, 클라이언트 프로바이더는 같은 플래그로 같은 `effectiveLocale`을 계산한다. 플래그가 꺼져 있으면 서버·클라이언트 모두 `ko`라, 렌더 결과가 어긋나지 않는다.

## 되돌릴 수 있어야 진짜 무중단

킬스위치의 진짜 값어치는 **배포 없이 즉시 되돌릴 수 있다**는 데 있다.

- **점진 롤아웃** - GrowthBook에서 특정 비율·특정 사용자 그룹에만 먼저 켠다
- **즉시 차단** - 번역 사고가 발견되면 플래그를 끄는 순간 전원이 `ko`로 안전 복귀한다. 롤백 배포를 기다릴 필요가 없다

"기능을 못 되돌리면 못 켠다"가 원칙이었고, 킬스위치가 그 원칙을 지켜줬다.

## 테스트는 ko로 고정

로케일이 테스트마다 흔들리면 스냅샷·E2E가 불안정해진다. 그래서 테스트 환경의 로케일은 기본 `ko`로 고정했다. 그리고 "플래그가 꺼지면 무조건 ko"라는 **불변식 자체를 유닛 테스트로 박아뒀다.**

```ts
test('forces ko when i18n is disabled, regardless of language/system', () => {
  expect(resolveEffectiveLocale({ languageCode: 'en', systemLocale: 'ja-JP', i18nEnabled: false })).toBe('ko')
  expect(resolveEffectiveLocale({ languageCode: 'ja', i18nEnabled: false })).toBe('ko')
  expect(resolveEffectiveLocale({ languageCode: 'en', i18nEnabled: true })).toBe('en')
})
```

이 테스트가 초록불인 한, 누가 로케일 로직을 건드려도 "킬스위치 off = 전원 ko"라는 안전판은 깨지지 않는다.

## 마치며

무중단 롤아웃의 핵심은 결국 **되돌릴 수 있는 구조**였다.

- 로케일 결정을 `resolveEffectiveLocale` 단일 차단점으로 모으고
- GrowthBook `i18n_enabled` 하나로 서버·클라이언트를 동시에 제어하고
- "off면 무조건 ko" 불변식을 테스트로 고정

여기까지가 프론트엔드 이야기다. 그런데 프론트에서 아무리 잘 번역해도, 서버가 한국어 응답이나 한국어 문서를 내려주면 화면에 다시 한국어가 섞인다. 마지막 편에서 백엔드가 사용자 언어·시간대를 어떻게 저장하고 응답·문서까지 로케일을 흘려보냈는지 다룬다.
