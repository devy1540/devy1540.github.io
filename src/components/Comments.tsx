import Giscus from "@giscus/react"
import { useTheme } from "@/hooks/useTheme"
import { useLanguage } from "@/i18n"

export function Comments() {
  const { resolvedTheme } = useTheme()
  const { language } = useLanguage()
  const giscusTheme = resolvedTheme === "dark" ? "dark" : "light"

  return (
    <div className="mt-10">
      <Giscus
        key={`${giscusTheme}-${language}`}
        repo="devy1540/devy1540.github.io"
        repoId="R_kgDOPgWYuQ"
        category="General"
        categoryId="DIC_kwDOPgWYuc4C3MZ-"
        strict="0"
        loading="lazy"
        mapping="pathname"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={giscusTheme}
        lang={language}
      />
    </div>
  )
}
