import fs from "node:fs"
import path from "node:path"
import type { Plugin } from "vite"

// 로컬에서도 GitHub Pages와 같은 정적 경로 및 404 응답을 검증한다.
export function previewPagesPlugin(): Plugin {
  return {
    name: "preview-github-pages",
    configurePreviewServer(server) {
      const folder = path.resolve(server.config.root, server.config.build.outDir)
      server.middlewares.use((req, res, next) => {
        if (!req.headers.accept?.includes("text/html")) return next()
        let pathname: string
        try { pathname = decodeURIComponent(new URL(req.url ?? "/", "http://localhost").pathname) } catch { return next() }
        const file = path.resolve(folder, "." + pathname)
        if (!file.startsWith(folder + path.sep) && file !== folder) return next()
        if (fs.existsSync(file) || fs.existsSync(path.join(file, "index.html"))) return next()
        const fallback = path.join(folder, "404.html")
        if (!fs.existsSync(fallback)) return next()
        res.statusCode = 404
        res.setHeader("Content-Type", "text/html; charset=utf-8")
        res.end(fs.readFileSync(fallback))
      })
    },
  }
}
