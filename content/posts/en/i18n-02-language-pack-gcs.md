---
title: "Service Internationalization (2) - Serving Language Packs: Bundle, GCS Runtime Load, and Cache"
date: "2026-06-03"
updated: "2026-06-03"
description: "If you ship translations together with the app, every one-line copy fix means a redeploy. This post covers the structure that loads language packs from GCS at runtime and falls back to the bundle, plus the cache problem where copy wouldn't change even after deploying."
tags: ["i18n", "nextjs", "gcs", "typescript"]
series: "Service Internationalization"
seriesOrder: 2
draft: false
---

## The problem: bundling translations into the app means a deploy for every copy fix

In [part 1](/posts/i18n-01-foundation) we moved the on-screen copy into per-locale JSON. So when do we load this JSON? The easiest option is to **include it in the build bundle**. But then every typo, every one-line copy fix, forces us to rebuild and redeploy the app. And translations are one of the things that change most often while a service is running.

So we set the goal like this: **change copy without a deploy, but no matter what happens, never let the screen break.**

## The choice: runtime load + bundle fallback

Bundling and runtime loading come with a trade-off.

- **Bundle** - Fast and certain. It ships with the app, so it's always present. The catch is that changing it requires a redeploy.
- **Runtime load** - Copy can be updated any time. The catch is that if the load fails, the screen goes blank.

We decided to use **both**. Normally we fetch the latest pack at runtime, but if that fails, we fall back to the bundle catalog included in the build. It's a structure that gives us freshness and stability at the same time.

## Publishing the git JSON to GCS as versioned packs

As mentioned before, **the JSON in git is the single source of truth**. A separate publish script carries this JSON over to GCS. It uploads a timestamped versioned pack together with a `metadata.json` that points to which pack is the latest.

```js
// scripts/publish-i18n-gcs.mjs (gist)
for (const locale of ['ko', 'en', 'ja']) {
  const body = await readFile(`.../messages/${locale}.json`, 'utf-8')
  const objectPath = `intl/${locale}_${timestamp}.json`   // versioned pack
  await bucket.file(objectPath).save(body, { contentType, resumable: false })
  files[locale] = { path: `/${objectPath}`, timestamp, size: body.length }
}

// pointer to the latest pack
await bucket.file('intl/metadata.json')
  .save(JSON.stringify({ lastUpdated: timestamp, files }))
```

Because it's a timestamped versioned pack + pointer (`metadata.json`) structure, a rollback is just reverting the metadata. For authentication we use Workload Identity/ADC instead of a key file.

## The runtime loader: read metadata, and on failure fall back to the bundle

The load happens on the server (an App Router server component). It reads `metadata.json`, fetches each locale's pack, and **on a per-locale failure, falls back to the bundle for that locale only**. A full failure, such as an unconfigured bucket or a failure of the metadata itself, falls back wholesale to the bundle catalog.

```ts
const loadFromGcs = async () => {
  if (!BUCKET_NAME) return bundledMessages            // bucket not configured → bundle

  const bucket = new Storage().bucket(BUCKET_NAME)
  const metadata = await downloadJson(bucket, 'intl/metadata.json')

  const entries = await Promise.all(
    SUPPORTED_LOCALES.map(async (locale) => {
      try {
        const path = metadata.files?.[locale]?.path
        if (!path) return [locale, bundledMessages[locale]]
        return [locale, await downloadJson(bucket, path)]
      } catch {
        return [locale, bundledMessages[locale]]        // fall back to bundle for this locale only
      }
    }),
  )
  return Object.fromEntries(entries)
}
```

Thanks to this structure, even if only the ja pack is uploaded incorrectly, only ja drops to the bundle while ko and en keep using the latest pack as-is. The key point is: "an incident in one locale doesn't bring the whole thing down."

## We deployed, but the old copy still won't change

This is where a real headache showed up. Hitting GCS on every request is slow and expensive, so we wrapped it in `unstable_cache`.

```ts
export const loadLanguagePacks = () =>
  unstable_cache(
    async () => {
      try { return await loadFromGcs() } catch { return bundledMessages }
    },
    ['i18n-language-packs'],
    { tags: ['i18n-language-packs'], revalidate: 600 },   // ← this TTL is the key
  )()
```

At first we set `revalidate: false`. The thinking was, "we can just revalidate language packs by tag when we publish." But **even after deploying, the old copy kept showing up.**

The cause was the cache store. Our deployment uses `cache-handler` to **persist the Next cache in Redis**. `revalidate: false` effectively means "cache indefinitely," so even after redeploying the app, the old catalog still sitting in Redis kept being served. Even though the build changed, the cache key was the same, so it was never invalidated.

The fix was simple. We **gave it a TTL** (`revalidate: 600`). We revalidate immediately by tag on publish, but even if that's missed, it naturally rolls over to the new pack within at most 10 minutes. In effect, we added one more safety net — an "expiry" — to the persistent cache.

## Wrap-up

What we learned from serving language packs was, in the end, **stacking layers of fallback**.

- git JSON (SSOT) → publish as GCS versioned packs + a metadata pointer
- Runtime load, but with bundle fallback at both the per-locale and full-failure level
- Put a TTL safety net on the persistent cache to prevent the "won't change even after deploying" incident

Now copy can be changed without a deploy, and no matter what happens, the screen renders. What's left is **how to safely turn this internationalization on for real users**. In the next part, I'll cover the story of rolling out i18n gradually with zero downtime using a GrowthBook kill switch.
