---
title: "Service Internationalization (3) - Zero-Downtime Rollout with a GrowthBook Kill Switch"
date: "2026-06-17"
description: "Even with all translations ready, flipping the switch for everyone at once is risky. The story of funneling locale decisions into a single choke point and rolling out i18n with zero downtime, gradually, via a GrowthBook kill switch."
tags: ["i18n", "nextjs", "growthbook", "feature-flag"]
series: "Service Internationalization"
seriesOrder: 3
draft: false
---

## Background

In parts 1 and 2, I moved copy into a message catalog and got the language packs served from GCS. So can I just turn it on for everyone now? No. Opening up i18n to everyone in one shot is risky.

- Some screen with a missing translation might still be lurking somewhere, so Korean could pop out unexpectedly
- The same sentence differs in length across Japanese and English, so layouts can break
- Awkward or wrong translations might surface only later

So the goal was singular. **Turn it on gradually, but if something goes wrong, roll it back instantly without a deploy.** That mechanism is the GrowthBook kill switch.

## Funneling locale decisions into one place: a single choke point

For a kill switch to work properly, the point that decides "what is this request's locale" must be **exactly one place**. If everyone decides the locale on their own all over the codebase, then even with the kill switch off, something somewhere still renders in Japanese.

So I funneled the decision into a single `resolveEffectiveLocale`, and injected the flag (`i18nEnabled`) into it.

```ts
export const resolveEffectiveLocale = ({
  languageCode, systemLocale, acceptLanguage, i18nEnabled = true,
}: ResolveArgs): Locale => {
  // i18n kill switch - if off, ko no matter what. The single choke point for locale decisions.
  if (!i18nEnabled) return 'ko'

  const code = normalizeLanguageCode(languageCode)
  if (code !== 'system') return code

  return normalizeLocale(systemLocale)
    ?? resolveLocaleFromAcceptLanguage(acceptLanguage)
    ?? FALLBACK_LOCALE
}
```

When the flag is off, whether the user's setting is `en` or `ja`, whatever the system language is, it **falls back to Korean unconditionally.** It's as if I put a switch on the one gate every locale must pass through. The flag value is managed by a single `i18n_enabled` in GrowthBook.

## Making the server and client reach the same decision

Because it's the Next.js App Router, the locale is used on both the server (the layout) and the client (the provider). If the two pick different locales, hydration breaks. So **both feed the same flag into the same `resolveEffectiveLocale`.**

```tsx
// Server: the layout reads the flag and passes it down
const i18nEnabled = flagResult.values[FEATURE_FLAG_KEYS.I18N_ENABLED]?.enabled ?? false
// ...
<I18nProvider i18nEnabled={i18nEnabled} /* ... */>
```

The server reads the flag to decide `html lang` and the first render, and the client provider computes the same `effectiveLocale` from the same flag. When the flag is off, both server and client are `ko`, so the render results don't diverge.

## True zero-downtime means being able to roll back

The real worth of a kill switch is that you can **roll it back instantly without a deploy.**

- **Gradual rollout** - In GrowthBook, turn it on first for only a certain percentage or a certain user group
- **Instant cutoff** - If a translation incident is found, the moment you flip the flag off, everyone safely reverts to `ko`. No need to wait for a rollback deploy

"If you can't roll a feature back, you can't turn it on" was the principle, and the kill switch upheld that principle.

## Pin tests to ko

If the locale wavers from test to test, snapshots and E2E become flaky. So I pinned the locale in the test environment to `ko` by default. And I **nailed down the invariant itself in a unit test** - "if the flag is off, always ko."

```ts
test('forces ko when i18n is disabled, regardless of language/system', () => {
  expect(resolveEffectiveLocale({ languageCode: 'en', systemLocale: 'ja-JP', i18nEnabled: false })).toBe('ko')
  expect(resolveEffectiveLocale({ languageCode: 'ja', i18nEnabled: false })).toBe('ko')
  expect(resolveEffectiveLocale({ languageCode: 'en', i18nEnabled: true })).toBe('en')
})
```

As long as this test stays green, no matter who touches the locale logic, the safety net of "kill switch off = everyone ko" won't break.

## Wrap-up

The core of a zero-downtime rollout was ultimately **a structure you can roll back.**

- Funnel locale decisions into the `resolveEffectiveLocale` single choke point
- Control server and client at once with a single GrowthBook `i18n_enabled`
- Pin the "if off, always ko" invariant with a test

That's the frontend story so far. But no matter how well you translate on the frontend, if the server hands down a Korean response or a Korean document, Korean gets mixed back into the screen. In the final part, I'll cover how the backend stored the user's language and time zone and carried the locale all the way through to responses and documents.
