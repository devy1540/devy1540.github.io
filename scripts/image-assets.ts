import fs from "node:fs/promises"
import path from "node:path"
import { createHash } from "node:crypto"
import sharp from "sharp"
import type { Plugin } from "vite"

interface ImageAsset { src: string; width: number; height: number; srcSet: string }

export function imageAssetsPlugin(): Plugin {
  let root = "", productionBuild = false
  const images: Record<string, ImageAsset> = {}
  const outputs = new Map<string, Buffer>()
  async function walk(folder: string): Promise<string[]> {
    const entries = await fs.readdir(folder, { withFileTypes: true })
    const groups = await Promise.all(entries.map(entry => entry.isDirectory() ? walk(path.join(folder, entry.name)) : Promise.resolve(/\.(png|jpe?g)$/i.test(entry.name) ? [path.join(folder, entry.name)] : [])))
    return groups.flat()
  }
  return {
    name: "post-image-assets",
    configResolved(config) { root = config.root; productionBuild = config.command === "build" && !config.build.ssr },
    async buildStart() {
      const folder = path.join(root, "public/images")
      const cache = path.join(root, "node_modules/.cache/post-images")
      await fs.mkdir(cache, { recursive: true })
      for (const file of await walk(folder)) {
        this.addWatchFile(file)
        const raw = await fs.readFile(file)
        const metadata = await sharp(raw).metadata()
        if (!metadata.width || !metadata.height) continue
        const hash = createHash("sha256").update(raw).update("webp-86-v1").digest("hex").slice(0, 10)
        const source = "/" + path.relative(path.join(root, "public"), file).split(path.sep).join("/")
        const base = source.replace(/\.(png|jpe?g)$/i, "")
        const widths = [...new Set([640, 1280, 1600].map(width => Math.min(width, metadata.width!)))]
        const variants = []
        for (const width of widths) {
          const url = `${base}-${hash}-${width}.webp`
          const cached = path.join(cache, createHash("sha256").update(url).digest("hex") + ".webp")
          let data: Buffer
          try { data = await fs.readFile(cached) }
          catch {
            data = await sharp(raw).resize({ width, withoutEnlargement: true }).webp({ quality: 86, effort: 6 }).toBuffer()
            await fs.writeFile(cached, data)
          }
          outputs.set(url, data)
          if (productionBuild) this.emitFile({ type: "asset", fileName: url.slice(1), source: data })
          variants.push({ url, width })
        }
        const largest = variants.at(-1)!
        images[source] = { src: largest.url, width: largest.width, height: Math.round(metadata.height * largest.width / metadata.width), srcSet: variants.map(item => `${item.url} ${item.width}w`).join(", ") }
      }
    },
    resolveId(id) { if (id === "virtual:post-images") return "\0virtual:post-images" },
    load(id) { if (id === "\0virtual:post-images") return `export default ${JSON.stringify(images)}` },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url ?? "/", "http://localhost").pathname
        const data = outputs.get(url)
        if (!data) return next()
        res.setHeader("Content-Type", "image/webp")
        res.end(data)
      })
    },
  }
}
