---
title: "Service Internationalization (3) - Zero-Downtime Rollout with a GrowthBook Kill Switch"
date: "2026-06-17"
updated: "2026-10-28"
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

So the goal was singular. **Turn it on gradually, but retain a way to roll it back without a deploy.** That mechanism is the GrowthBook kill switch.

This article follows the decision from **the server reading a flag to the client using the same locale for its first render**. The prerequisites are [locale precedence](/posts/i18n-01-foundation/) and [language-pack delivery and caching through GCS](/posts/i18n-02-language-pack-gcs/).

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

### What the flag changes, and what it preserves

The kill switch changes the **effective locale for this render**, not the user’s saved language preference. Keeping the saved preference allows the user’s choice to take effect again when the feature is enabled.

| Flag | User preference | System or browser setting | Decision for this render |
|---|---|---|---|
| Off | `en` or `ja` | Any value | `ko` |
| On | Explicit `en` | `ja-JP` | `en` |
| On | `system` | Supported system locale is available | System locale |
| On | `system` | System locale cannot be resolved | `Accept-Language`, then the fallback locale |

These branches follow directly from the function above. Checking the flag first prevents a lower-priority setting from overriding the disabled state.

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

The value of a kill switch is that you can **restore the effective locale without deploying rollback code.**

- **Gradual rollout** - In GrowthBook, turn it on first for only a certain percentage or a certain user group
- **Cutoff** - Turn the flag off when a translation problem appears. Requests that read the new flag value return to `ko` without waiting for a rollback deploy

"If you can't roll a feature back, you can't turn it on" was the principle, and the kill switch upheld that principle.

### An already open page may still have the previous value

The code above does not guarantee an immediate update in every open browser. The server passes its flag value to the provider, so an existing document can retain the old value. Propagation depends on flag caching and on when a new request or render occurs.

Before a rollout, check these boundaries.

1. **Targeting**: Do the server and client evaluate the same user or group?
2. **First render**: Do `html lang`, the message catalog, and the client’s initial locale agree?
3. **Flag caching**: When does a new request see the disabled value, and where can an older value remain cached?
4. **Existing pages**: Are refreshed pages and already open pages checked separately?
5. **Preserved data**: Does disabling the feature retain the user’s language preference and the Korean language pack?

Fetching a language pack from a CDN and selecting a locale are separate decisions. A cached non-Korean pack must not override an effective locale of `ko`.

## Pin tests to ko

If the locale wavers from test to test, snapshots and E2E become flaky. So I pinned the locale in the test environment to `ko` by default. And I **nailed down the invariant itself in a unit test** - "if the flag is off, always ko."

```ts
test('forces ko when i18n is disabled, regardless of language/system', () => {
  expect(resolveEffectiveLocale({ languageCode: 'en', systemLocale: 'ja-JP', i18nEnabled: false })).toBe('ko')
  expect(resolveEffectiveLocale({ languageCode: 'ja', i18nEnabled: false })).toBe('ko')
  expect(resolveEffectiveLocale({ languageCode: 'en', i18nEnabled: true })).toBe('en')
})
```

This test checks the function’s rule that a disabled flag produces an effective locale of `ko`. It does not prove that the server and browser receive the same flag, so a rendered-page check is needed as well.

The following test example covers more combinations of user and browser preferences. The disabled flag must take precedence in every case.

```ts
test.each([
  { languageCode: 'en', systemLocale: 'ja-JP', acceptLanguage: 'en-US' },
  { languageCode: 'ja', systemLocale: 'en-US', acceptLanguage: 'ja-JP' },
  { languageCode: 'system', systemLocale: 'ja-JP', acceptLanguage: 'en-US' },
])('keeps ko while the kill switch is off: %o', (input) => {
  expect(resolveEffectiveLocale({ ...input, i18nEnabled: false })).toBe('ko')
})
```

After the unit test, open the first request for an `en` user with the feature enabled and disabled. Compare the initial HTML with the hydrated page: the locale should not change unexpectedly, and raw translation keys should not appear.

## Wrap-up

The core of a zero-downtime rollout was ultimately **a structure you can roll back.**

- Funnel locale decisions into the `resolveEffectiveLocale` single choke point
- Control server and client at once with a single GrowthBook `i18n_enabled`
- Pin the "if off, always ko" invariant with a test

That's the frontend story so far. But no matter how well you translate on the frontend, if the server hands down a Korean response or a Korean document, Korean gets mixed back into the screen. [Backend locale handling](/posts/i18n-04-backend-locale/) covers the boundary between stored language preferences and API responses. [Localized document rendering](/posts/i18n-05-document-render/) continues that flow into generated documents.
