---
title: "서비스 국제화 적용기 (3) - GrowthBook 킬스위치로 무중단 점진 롤아웃"
date: "2026-06-17"
updated: "2026-10-28"
description: "번역을 다 만들었어도 전원에게 한 번에 켜면 위험하다. 로케일 결정을 단일 차단점으로 모으고 GrowthBook 킬스위치로 i18n을 무중단·점진 롤아웃한 이야기."
tags: ["i18n", "nextjs", "growthbook", "feature-flag"]
series: "서비스 국제화 적용기"
seriesOrder: 3
draft: false
---

## 배경

1·2편에서 문구를 메시지 카탈로그로 옮기고 언어팩을 GCS에서 서빙하는 것까지 만들었다. 그럼 이제 전 사용자에게 켜면 될까? 아니다. i18n을 한 번에 전면 오픈하는 건 위험하다.

- 번역이 빠진 화면이 어딘가 남아 한국어가 튀어나올 수 있고
- 일본어·영어는 같은 문장도 길이가 달라 레이아웃이 깨질 수 있고
- 번역 자체가 어색하거나 틀린 곳이 뒤늦게 발견될 수 있다

그래서 목표는 하나였다. **점진적으로 켜되, 문제가 생기면 배포 없이 되돌릴 수 있게 한다.** 그 장치가 GrowthBook 킬스위치다.

이 글은 **서버가 플래그를 읽고 로케일을 결정한 뒤, 같은 결정을 클라이언트의 첫 렌더까지 전달하는 흐름**을 다룬다. 로케일 우선순위는 [국제화 기반 설계](/posts/i18n-01-foundation/), 번역 파일의 배포와 캐시는 [GCS 언어팩 구성](/posts/i18n-02-language-pack-gcs/)에서 이어진다.

## 로케일 결정을 한 곳으로 모은다

킬스위치가 제대로 동작하려면, "이 요청의 로케일은 무엇인가"를 결정하는 지점이 **딱 한 곳**이어야 한다. 여기저기서 각자 로케일을 정하면, 킬스위치를 꺼도 어딘가는 여전히 일본어로 나온다.

그래서 `resolveEffectiveLocale` 하나로 결정을 모으고 여기에 플래그(`i18nEnabled`)를 주입했다.

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

### 플래그가 바꾸는 것과 남겨두는 것

킬스위치는 사용자가 저장한 언어 설정을 지우는 기능이 아니다. 저장된 설정은 그대로 두고, 이번 렌더에 사용할 **유효 로케일**만 바꾼다. 다시 켰을 때 사용자의 선택을 복원할 수 있어야 하기 때문이다.

| 플래그 | 사용자 설정 | 시스템·브라우저 설정 | 이번 렌더의 결정 |
|---|---|---|---|
| 꺼짐 | `en` 또는 `ja` | 어떤 값이든 | `ko` |
| 켜짐 | 명시적인 `en` | `ja-JP` | `en` |
| 켜짐 | `system` | 지원하는 시스템 로케일 있음 | 시스템 로케일 |
| 켜짐 | `system` | 시스템 로케일을 결정하지 못함 | `Accept-Language`, 이후 기본 로케일 |

위 표는 앞의 함수에서 읽을 수 있는 분기 규칙이다. 플래그 분기를 가장 먼저 검사하므로, 꺼져 있을 때는 하위 우선순위가 결과를 뒤집을 수 없다.

## 서버와 클라이언트가 같은 결정을 하게

Next.js App Router라 로케일은 서버(레이아웃)와 클라이언트(프로바이더) 양쪽에서 쓰인다. 두 곳이 서로 다른 로케일을 고르면 hydration이 깨진다. 그래서 **둘 다 같은 `resolveEffectiveLocale`에 같은 플래그를 먹인다.**

```tsx
// 서버: 레이아웃에서 플래그를 읽어 내려줌
const i18nEnabled = flagResult.values[FEATURE_FLAG_KEYS.I18N_ENABLED]?.enabled ?? false
// ...
<I18nProvider i18nEnabled={i18nEnabled} /* ... */>
```

서버는 플래그를 읽어 `html lang`과 첫 렌더를 정하고 클라이언트 프로바이더는 같은 플래그로 같은 `effectiveLocale`을 계산한다. 플래그가 꺼져 있으면 서버·클라이언트 모두 `ko`라, 렌더 결과가 어긋나지 않는다.

## 되돌릴 수 있어야 진짜 무중단

킬스위치의 값어치는 **롤백용 코드를 다시 배포하지 않고도 유효 로케일을 되돌릴 수 있다**는 데 있다.

- **점진 롤아웃** - GrowthBook에서 특정 비율·특정 사용자 그룹에만 먼저 켠다
- **차단** - 번역 사고가 발견되면 플래그를 끈다. 새 플래그 값을 읽은 요청은 `ko`로 돌아가므로 롤백 배포를 기다리지 않아도 된다

"기능을 못 되돌리면 못 켠다"가 원칙이었고 킬스위치가 그 원칙을 지켜줬다.

### 열린 화면까지 즉시 바뀐다는 뜻은 아니다

위 코드만으로는 이미 열린 모든 브라우저에 변경 사항이 즉시 전파된다고 보장할 수 없다. 서버가 읽은 플래그를 프로바이더에 전달하므로, 열린 문서에는 이전 값이 남아 있을 수 있다. 실제 반영 시점은 플래그 캐시와 새 요청·새 렌더가 발생하는 시점에 달려 있다.

운영 시에는 다음 경계를 확인해야 한다.

1. **대상 식별**: 서버와 클라이언트가 같은 사용자·그룹을 기준으로 플래그를 평가하는가.
2. **첫 렌더**: 서버의 `html lang`, 메시지 카탈로그, 클라이언트 초기 로케일이 같은가.
3. **플래그 캐시**: 꺼진 값을 새 요청이 언제 읽는지, 캐시 때문에 이전 값이 남는 구간이 있는가.
4. **기존 화면**: 새로고침한 화면과 이미 열려 있던 화면을 구분해 확인했는가.
5. **데이터 보존**: 차단 과정에서 사용자 언어 설정이나 한국어 언어팩을 삭제하지 않는가.

언어팩을 CDN에서 다시 받는 문제와 어떤 로케일을 선택할지는 별개다. 언어팩이 캐시에 남아 있어도 유효 로케일이 `ko`면 한국어 메시지로 렌더해야 한다.

## 테스트는 ko로 고정

로케일이 테스트마다 흔들리면 스냅샷·E2E가 불안정해진다. 그래서 테스트 환경의 로케일은 기본 `ko`로 고정했다. 그리고 "플래그가 꺼지면 무조건 ko"라는 **불변식 자체를 유닛 테스트로 박아뒀다.**

```ts
test('forces ko when i18n is disabled, regardless of language/system', () => {
  expect(resolveEffectiveLocale({ languageCode: 'en', systemLocale: 'ja-JP', i18nEnabled: false })).toBe('ko')
  expect(resolveEffectiveLocale({ languageCode: 'ja', i18nEnabled: false })).toBe('ko')
  expect(resolveEffectiveLocale({ languageCode: 'en', i18nEnabled: true })).toBe('en')
})
```

이 테스트는 "플래그 off = 유효 로케일 ko"라는 함수의 규칙을 확인한다. 서버와 브라우저가 실제로 같은 플래그를 받는지까지 증명하지는 않으므로, 화면 검증도 함께 필요하다.

다음은 위 함수의 차단 규칙을 더 넓게 확인하는 테스트 예제다. 사용자 설정과 브라우저 언어를 바꿔도 꺼진 플래그가 우선해야 한다.

```ts
test.each([
  { languageCode: 'en', systemLocale: 'ja-JP', acceptLanguage: 'en-US' },
  { languageCode: 'ja', systemLocale: 'en-US', acceptLanguage: 'ja-JP' },
  { languageCode: 'system', systemLocale: 'ja-JP', acceptLanguage: 'en-US' },
])('keeps ko while the kill switch is off: %o', (input) => {
  expect(resolveEffectiveLocale({ ...input, i18nEnabled: false })).toBe('ko')
})
```

이 단위 테스트 다음에는 `en` 사용자의 첫 요청을 켜진 상태와 꺼진 상태에서 각각 열어본다. 초기 HTML과 hydration 뒤 화면에서 로케일이 바뀌거나 번역 키 자체가 노출되지 않는지 확인하는 순서다.

## 마치며

무중단 롤아웃의 핵심은 결국 **되돌릴 수 있는 구조**였다.

- 로케일 결정을 `resolveEffectiveLocale` 단일 차단점으로 모으고
- GrowthBook `i18n_enabled` 하나로 서버·클라이언트를 동시에 제어하고
- "off면 무조건 ko" 불변식을 테스트로 고정

여기까지가 프론트엔드 이야기다. 그런데 프론트에서 아무리 잘 번역해도, 서버가 한국어 응답이나 한국어 문서를 내려주면 화면에 다시 한국어가 섞인다. [백엔드 로케일 처리](/posts/i18n-04-backend-locale/)에서는 사용자 언어·시간대를 저장하고 응답으로 전달하는 경계를, [다국어 문서 렌더링](/posts/i18n-05-document-render/)에서는 그 로케일을 문서까지 이어가는 과정을 다룬다.
