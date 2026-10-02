const supported = ["bash", "css", "dockerfile", "groovy", "html", "java", "javascript", "json", "kotlin", "php", "properties", "tsx", "typescript", "xml", "yaml"] as const
export type SupportedLanguage = typeof supported[number]
const names = new Set<string>(supported)
const aliases: Record<string, SupportedLanguage> = { docker: "dockerfile", js: "javascript", kt: "kotlin", sh: "bash", shell: "bash", ts: "typescript", yml: "yaml", zsh: "bash" }
export function normalizeCodeLanguage(language: string): SupportedLanguage | undefined {
  const normalized = language.toLowerCase()
  if (names.has(normalized)) return normalized as SupportedLanguage
  return Object.prototype.hasOwnProperty.call(aliases, normalized) ? aliases[normalized] : undefined
}
