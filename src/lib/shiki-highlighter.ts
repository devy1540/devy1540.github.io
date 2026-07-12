import { createBundledHighlighter, createSingletonShorthands } from "shiki/core"
import { createOnigurumaEngine } from "shiki/engine/oniguruma"

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

type SupportedLanguage = keyof typeof languages
type SupportedTheme = keyof typeof themes

const languageAliases: Record<string, SupportedLanguage> = {
  docker: "dockerfile",
  js: "javascript",
  kt: "kotlin",
  properties: "properties",
  sh: "bash",
  shell: "bash",
  ts: "typescript",
  yml: "yaml",
  zsh: "bash",
}

const createHighlighter = createBundledHighlighter<SupportedLanguage, SupportedTheme>({
  langs: languages,
  themes,
  engine: () => createOnigurumaEngine(import("shiki/wasm")),
})

const { codeToHtml } = createSingletonShorthands(createHighlighter)

function normalizeLanguage(language: string): SupportedLanguage | undefined {
  const normalized = language.toLowerCase()
  if (normalized in languages) return normalized as SupportedLanguage
  return languageAliases[normalized]
}

export async function highlightCode(code: string, language: string) {
  const normalizedLanguage = normalizeLanguage(language)
  if (!normalizedLanguage) return ""

  return codeToHtml(code, {
    lang: normalizedLanguage,
    themes: {
      light: "github-light",
      dark: "github-dark",
    },
    defaultColor: false,
  })
}
