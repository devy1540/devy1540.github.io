import type { Language } from "@/i18n"
import { REPO_NAME, REPO_OWNER } from "./config"

const API_BASE = "https://api.github.com"
const POST_LANGUAGES: Language[] = ["ko", "en"]

export class GitHubApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "GitHubApiError"
    this.status = status
  }
}

export interface GitHubUser {
  login: string
  name: string | null
  avatarUrl: string
}

export interface PostFile {
  slug: string
  language: Language
  path: string
  /** blob sha. 커밋(PUT) 시 충돌 방지를 위해 필요하다. */
  sha: string
  title: string
  draft: boolean
  date: string
  /** 원본 마크다운 전체(frontmatter 포함). draft 토글 시 그대로 재사용한다. */
  raw: string
}

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  }
}

// ── base64 (UTF-8 안전) ──────────────────────────────────────────────
// GitHub Contents API는 본문을 base64로 주고받는다. 한글 등 멀티바이트가
// 깨지지 않도록 TextEncoder/TextDecoder를 거친다.

function decodeBase64(b64: string): string {
  const binary = atob(b64.replace(/\n/g, ""))
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ""
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary)
}

// ── frontmatter ──────────────────────────────────────────────────────

interface ParsedFrontmatter {
  title?: string
  date?: string
  draft: boolean
}

function parseFrontmatter(raw: string): ParsedFrontmatter {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/)
  if (!match) return { draft: false }

  const data: Record<string, string> = {}
  for (const line of match[1]!.split(/\r?\n/)) {
    const idx = line.indexOf(":")
    if (idx === -1) continue
    let value = line.slice(idx + 1).trim()
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
    data[line.slice(0, idx).trim()] = value
  }

  return {
    title: data.title,
    date: data.date,
    draft: data.draft === "true",
  }
}

/**
 * frontmatter의 `draft` 값을 설정한다. 기존 내용/순서는 보존한다.
 * - draft 라인이 있으면 값만 교체
 * - 없으면 frontmatter 끝에 추가
 * - frontmatter 자체가 없으면 새로 만들어 앞에 붙임
 */
export function setDraftInFrontmatter(raw: string, draft: boolean): string {
  const match = raw.match(/^(---\r?\n)([\s\S]*?)(\r?\n---\r?\n?)([\s\S]*)$/)
  if (!match) {
    return `---\ndraft: ${draft}\n---\n\n${raw}`
  }

  const [, open, body, close, rest] = match
  const lines = body!.split(/\r?\n/)
  let replaced = false
  const nextLines = lines.map((line) => {
    if (/^\s*draft\s*:/.test(line)) {
      replaced = true
      return `draft: ${draft}`
    }
    return line
  })
  if (!replaced) nextLines.push(`draft: ${draft}`)

  return `${open}${nextLines.join("\n")}${close}${rest}`
}

// ── API ──────────────────────────────────────────────────────────────

export async function fetchAuthenticatedUser(token: string): Promise<GitHubUser> {
  const res = await fetch(`${API_BASE}/user`, { headers: authHeaders(token) })
  if (!res.ok) {
    throw new GitHubApiError("GitHub 사용자 정보를 가져오지 못했습니다.", res.status)
  }
  const data = await res.json()
  return { login: data.login, name: data.name ?? null, avatarUrl: data.avatar_url }
}

interface ContentEntry {
  type: string
  name: string
  path: string
  sha: string
}

async function listDirectory(token: string, dir: string): Promise<ContentEntry[]> {
  const res = await fetch(`${API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${dir}`, {
    headers: authHeaders(token),
  })
  if (res.status === 404) return []
  if (!res.ok) throw new GitHubApiError(`디렉터리 조회에 실패했습니다: ${dir}`, res.status)
  return res.json()
}

async function getFile(token: string, path: string): Promise<{ content: string; sha: string }> {
  const res = await fetch(`${API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${encodeURI(path)}`, {
    headers: authHeaders(token),
  })
  if (!res.ok) throw new GitHubApiError(`파일 조회에 실패했습니다: ${path}`, res.status)
  const data = await res.json()
  return { content: decodeBase64(data.content), sha: data.sha }
}

/**
 * 전체 글(발행 + 초안)을 frontmatter와 함께 조회한다.
 * draft 글은 프로덕션 번들에 없으므로 GitHub API에서 직접 읽어야 한다.
 */
export async function listPostFiles(token: string): Promise<PostFile[]> {
  const result: PostFile[] = []

  for (const language of POST_LANGUAGES) {
    const entries = (await listDirectory(token, `content/posts/${language}`)).filter(
      (entry) => entry.type === "file" && entry.name.endsWith(".md")
    )

    const files = await Promise.all(
      entries.map(async (entry) => {
        const { content, sha } = await getFile(token, entry.path)
        const fm = parseFrontmatter(content)
        const slug = entry.name.replace(/\.md$/, "")
        return {
          slug,
          language,
          path: entry.path,
          sha,
          title: fm.title || slug,
          draft: fm.draft,
          date: fm.date || "",
          raw: content,
        } satisfies PostFile
      })
    )

    result.push(...files)
  }

  return result.sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : a.slug.localeCompare(b.slug)))
}

/**
 * 글의 draft 상태를 토글하고 커밋한다. 성공 시 갱신된 blob sha를 돌려준다.
 * 커밋 → GitHub Actions 재빌드 → 재배포를 거쳐야 실제 사이트에 반영된다.
 */
export async function setPostDraft(
  token: string,
  file: PostFile,
  draft: boolean
): Promise<{ sha: string; raw: string }> {
  const raw = setDraftInFrontmatter(file.raw, draft)
  const message = `chore(post): ${file.language}/${file.slug} draft ${draft ? "설정" : "해제"}`

  const res = await fetch(`${API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${encodeURI(file.path)}`, {
    method: "PUT",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({ message, content: encodeBase64(raw), sha: file.sha }),
  })

  if (!res.ok) {
    const detail = await res.json().catch(() => null)
    throw new GitHubApiError(detail?.message || `커밋에 실패했습니다 (${res.status}).`, res.status)
  }

  const data = await res.json()
  return { sha: data.content.sha as string, raw }
}
