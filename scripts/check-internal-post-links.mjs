import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const postLinkPattern = new RegExp(
  String.raw`\[[^\]]*\]\(/posts/([^/?#)]+)/?(?:[?#][^)]*)?\)`,
  "g",
)

export function findMissingPostLinks(posts) {
  const slugs = new Set(posts.map((post) => path.basename(post.path, ".md")))
  const missing = []

  for (const post of posts) {
    for (const match of post.content.matchAll(postLinkPattern)) {
      const href = match[0].slice(match[0].lastIndexOf("(") + 1, -1)
      const slug = match[1]

      if (!slugs.has(slug)) {
        missing.push({ path: post.path, href, slug })
      }
    }
  }

  return missing
}

function run() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
  const postsDir = path.join(root, "content/posts")
  const posts = fs.readdirSync(postsDir, { recursive: true })
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const filePath = path.join(postsDir, file)
      return {
        path: path.relative(root, filePath),
        content: fs.readFileSync(filePath, "utf8"),
      }
    })
  const missing = findMissingPostLinks(posts)

  if (missing.length > 0) {
    console.error("Missing internal post links:")
    for (const item of missing) {
      console.error(`- ${item.path}: ${item.href}`)
    }
    process.exitCode = 1
    return
  }

  console.log(`Validated ${posts.length} posts with no missing internal post links.`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run()
}
