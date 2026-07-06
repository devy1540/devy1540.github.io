---
title: "서비스 국제화 적용기 (2) - 언어팩 서빙: 번들, GCS 런타임 로드, 그리고 캐시"
date: "2026-06-03"
description: "번역을 앱과 함께 배포하면 문구 한 줄 고칠 때마다 배포해야 한다. 언어팩을 GCS에서 런타임 로드하고 번들로 폴백한 구조, 그리고 배포해도 안 바뀌던 캐시 문제를 정리한다."
tags: ["i18n", "nextjs", "gcs", "typescript"]
series: "서비스 국제화 적용기"
seriesOrder: 2
draft: true
---

## 문제: 번역을 앱에 넣으면 문구 수정마다 배포다

[1편](/posts/i18n-01-foundation)에서 화면 문구를 로케일별 JSON으로 옮겼다. 그럼 이 JSON을 언제 로드할까? 가장 쉬운 건 **빌드 번들에 포함**하는 것이다. 하지만 그러면 오탈자 하나, 문구 한 줄을 고칠 때마다 앱을 다시 빌드·배포해야 한다. 번역은 운영 중에 가장 자주 바뀌는 것 중 하나인데 말이다.

그래서 목표를 이렇게 잡았다. **문구는 배포 없이 바꾸되, 무슨 일이 있어도 화면은 깨지지 않게.**

## 선택: 런타임 로드 + 번들 폴백

번들과 런타임 로드는 트레이드오프가 있다.

- **번들** - 빠르고 확실하다. 앱과 함께 나가니 항상 존재한다. 대신 수정하려면 재배포.
- **런타임 로드** - 문구를 언제든 갱신할 수 있다. 대신 로드 실패 시 화면이 빈다.

우리는 **둘 다** 쓰기로 했다. 평소엔 런타임에 최신 팩을 받아오되, 실패하면 빌드에 포함된 번들 카탈로그로 폴백한다. 최신성과 안정성을 동시에 가져가는 구조다.

## git JSON을 GCS에 버전드 팩으로 발행

앞서 말했듯 **git의 JSON이 단일 진실 원천**이다. 별도 발행 스크립트가 이 JSON을 GCS로 실어 나른다. 타임스탬프를 붙인 버전드 팩과, 어떤 팩이 최신인지 가리키는 `metadata.json`을 함께 올린다.

```js
// scripts/publish-i18n-gcs.mjs (요지)
for (const locale of ['ko', 'en', 'ja']) {
  const body = await readFile(`.../messages/${locale}.json`, 'utf-8')
  const objectPath = `intl/${locale}_${timestamp}.json`   // 버전드 팩
  await bucket.file(objectPath).save(body, { contentType, resumable: false })
  files[locale] = { path: `/${objectPath}`, timestamp, size: body.length }
}

// 최신 팩을 가리키는 포인터
await bucket.file('intl/metadata.json')
  .save(JSON.stringify({ lastUpdated: timestamp, files }))
```

타임스탬프 버전드 팩 + 포인터(`metadata.json`) 구조라, 롤백도 metadata만 되돌리면 된다. 인증은 키파일 없이 Workload Identity/ADC를 쓴다.

## 런타임 로더: metadata를 읽고, 실패는 번들로

로드는 서버(App Router 서버 컴포넌트)에서 한다. `metadata.json`을 읽어 각 로케일 팩을 받아오고, **로케일 단위 실패는 그 로케일만 번들로 폴백**한다. 버킷 미설정이나 metadata 자체 실패 같은 전체 실패는 통째로 번들 카탈로그로 폴백한다.

```ts
const loadFromGcs = async () => {
  if (!BUCKET_NAME) return bundledMessages            // 버킷 미설정 → 번들

  const bucket = new Storage().bucket(BUCKET_NAME)
  const metadata = await downloadJson(bucket, 'intl/metadata.json')

  const entries = await Promise.all(
    SUPPORTED_LOCALES.map(async (locale) => {
      try {
        const path = metadata.files?.[locale]?.path
        if (!path) return [locale, bundledMessages[locale]]
        return [locale, await downloadJson(bucket, path)]
      } catch {
        return [locale, bundledMessages[locale]]        // 이 로케일만 번들로 폴백
      }
    }),
  )
  return Object.fromEntries(entries)
}
```

이 구조 덕에, ja 팩만 잘못 올라가도 ja만 번들로 떨어지고 ko·en은 최신 팩을 그대로 쓴다. "한 로케일의 사고가 전체를 무너뜨리지 않는다"가 핵심이다.

## 배포했는데 옛날 문구가 안 바뀐다

여기서 진짜 삽질이 하나 나왔다. 매 요청마다 GCS를 때리면 느리고 비싸니, `unstable_cache`로 감쌌다.

```ts
export const loadLanguagePacks = () =>
  unstable_cache(
    async () => {
      try { return await loadFromGcs() } catch { return bundledMessages }
    },
    ['i18n-language-packs'],
    { tags: ['i18n-language-packs'], revalidate: 600 },   // ← 이 TTL이 핵심
  )()
```

처음엔 `revalidate: false`로 뒀다. "언어팩은 발행할 때 태그로 revalidate하면 되지"라는 생각이었다. 그런데 **배포를 해도 옛날 문구가 계속 나왔다.**

원인은 캐시 저장소였다. 우리 배포는 `cache-handler`로 Next 캐시를 **Redis에 영구 저장**한다. `revalidate: false`는 사실상 "무기한 캐시"라, 앱을 새로 배포해도 Redis에 남아 있는 구(舊) 카탈로그가 그대로 서빙됐다. 빌드가 바뀌어도 캐시 키가 같으니 안 풀린 것이다.

해결은 단순했다. **TTL을 부여**했다(`revalidate: 600`). 발행 시 태그 revalidate로 즉시 갱신하되, 혹시 그게 누락돼도 최대 10분이면 자연히 새 팩으로 넘어간다. 영구 캐시에 "만료"라는 안전망을 하나 더 둔 셈이다.

## 마치며

언어팩 서빙에서 배운 건 결국 **폴백의 층을 쌓는 일**이었다.

- git JSON(SSOT) → GCS 버전드 팩 + metadata 포인터로 발행
- 런타임 로드하되 로케일 단위·전체 단위로 번들 폴백
- 영구 캐시에는 TTL이라는 안전망을 둬서 "배포해도 안 바뀌는" 사고를 막음

이제 문구는 배포 없이 바꿀 수 있고, 무슨 일이 있어도 화면은 뜬다. 남은 건 **이 국제화를 실제 사용자에게 어떻게 안전하게 켜느냐**다. 다음 편에서 GrowthBook 킬스위치로 i18n을 무중단 점진 롤아웃한 이야기를 다룬다.
