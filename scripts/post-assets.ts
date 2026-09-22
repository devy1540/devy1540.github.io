import fs from "node:fs"
import path from "node:path"
import type { Plugin } from "vite"
import { parseFrontmatter } from "../src/lib/post-frontmatter.ts"
import { getReadingMinutes } from "../src/lib/reading-time.ts"

export function isPublished(raw: string, today: string) {
  const { data } = parseFrontmatter(raw)
  return data.draft !== "true" && data.draft !== true && !(data.publishDate && String(data.publishDate) > today)
}

export function postMetadataSource(raw: string) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/)
  if (!match) return raw
  const { content } = parseFrontmatter(raw)
  return `---\n${match[1]}\nreadingMinutes: ${getReadingMinutes(content)}\n---\n`
}

export function postAssetsPlugin(): Plugin {
  let root = ""
  let production = false
  return {
    name: "post-metadata-and-search",
    enforce: "pre",
    configResolved(config) { root = config.root; production = config.isProduction },
    resolveId(id) {
      if (/^virtual:post-search\/(ko|en)$/.test(id)) return `\0${id}`
    },
    load(id) {
      const language = id.match(/^\0virtual:post-search\/(ko|en)$/)?.[1]
      const today = new Date().toISOString().slice(0, 10)
      if (language) {
        const folder = path.join(root, "content/posts", language)
        const texts: Record<string, string> = {}
        for (const file of fs.readdirSync(folder).filter((file) => file.endsWith(".md"))) {
          const filename = path.join(folder, file)
          this.addWatchFile(filename)
          const raw = fs.readFileSync(filename, "utf8")
          if (!production || isPublished(raw, today)) texts[file.slice(0, -3)] = parseFrontmatter(raw).content.toLowerCase()
        }
        return `export default ${JSON.stringify(texts)}`
      }
      const [filename, query = ""] = id.split("?")
      if (!filename?.endsWith(".md")) return
      const params = new URLSearchParams(query)
      if (!params.has("post-meta") && !params.has("post-body")) return
      this.addWatchFile(filename)
      const raw = fs.readFileSync(filename, "utf8")
      const result = production && !isPublished(raw, today) ? "" : params.has("post-meta") ? postMetadataSource(raw) : raw
      return `export default ${JSON.stringify(result)}`
    },
    handleHotUpdate(context) {
      if (!context.file.endsWith(".md")) return
      for (const language of ["ko", "en"]) {
        const module = context.server.moduleGraph.getModuleById(`\0virtual:post-search/${language}`)
        if (module) context.server.moduleGraph.invalidateModule(module)
      }
      context.server.ws.send({ type: "full-reload" })
    },
  }
}
