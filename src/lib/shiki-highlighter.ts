import { createBundledHighlighter, createSingletonShorthands } from "shiki/core"
import { createOnigurumaEngine } from "shiki/engine/oniguruma"
import { createRenderQueue } from "./render-queue"
import { normalizeCodeLanguage, type SupportedLanguage } from "./code-languages"

const languages = {
  bash: () => import("@shikijs/langs/bash"),
  css: () => import("@shikijs/langs/css"),
  dockerfile: () => import("@shikijs/langs/dockerfile"),
  groovy: () => import("@shikijs/langs/groovy"),
  html: () => import("@shikijs/langs/html"),
  java: () => import("@shikijs/langs/java"),
  javascript: () => import("@shikijs/langs/javascript"),
  json: () => import("@shikijs/langs/json"),
  kotlin: () => import("@shikijs/langs/kotlin"),
  php: () => import("@shikijs/langs/php"),
  properties: () => import("@shikijs/langs/properties"),
  tsx: () => import("@shikijs/langs/tsx"),
  typescript: () => import("@shikijs/langs/typescript"),
  xml: () => import("@shikijs/langs/xml"),
  yaml: () => import("@shikijs/langs/yaml"),
} as const

const themes = {
  "github-light": () => import("@shikijs/themes/github-light"),
  "github-dark": () => import("@shikijs/themes/github-dark"),
} as const

type SupportedTheme = keyof typeof themes

const createHighlighter = createBundledHighlighter<SupportedLanguage, SupportedTheme>({
  langs: languages,
  themes,
  engine: () => createOnigurumaEngine(import("shiki/wasm")),
})

const { codeToHtml } = createSingletonShorthands(createHighlighter)

const request = createRenderQueue(async ({ code, language }: { code: string; language: SupportedLanguage }) => {
  return codeToHtml(code, {
    lang: language,
    themes: {
      light: "github-light",
      dark: "github-dark",
    },
    defaultColor: false,
  })
})

export function requestHighlight(code: string, language: string) {
  const normalizedLanguage = normalizeCodeLanguage(language)
  if (!normalizedLanguage) return { promise: Promise.resolve(""), cancel: () => {} }
  return request(`${normalizedLanguage}\0${code}`, { code, language: normalizedLanguage })
}
