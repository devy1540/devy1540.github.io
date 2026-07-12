# Search Console 내부 링크 무결성 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (\`- [ ]\`) syntax for tracking.

**Goal:** 미발행 Spring AI 4편 링크를 실제 글로 교체하고, 존재하지 않는 \`/posts/:slug\` Markdown 내부 링크를 CI 또는 로컬에서 검출한다.

**Architecture:** \`scripts/check-internal-post-links.mjs\`는 Markdown 파일명에서 게시글 slug 집합을 만들고, Markdown 링크 목적지의 \`/posts/:slug\`만 비교한다. 순수 검사 함수를 내보내 Node 내장 테스트로 검증하고, CLI 실행은 \`package.json\` 스크립트로 노출한다.

**Tech Stack:** Node.js ESM, Node 내장 \`node:test\`, TypeScript/Vite 빌드, Markdown 콘텐츠.

## Global Constraints

- 외부 링크, 앵커 링크, 쿼리 문자열, \`/posts/\` 이외의 내부 라우트는 검사하지 않는다.
- 누락된 링크는 파일 경로와 원래 링크 대상 전체를 모두 출력하고 종료 코드 1로 실패한다.
- 기존 미추적 \`AGENTS.md\`는 스테이징하거나 수정하지 않는다.
- Search Console에서 확인된 리디렉션·canonical 제외 항목을 코드로 자동 수정하지 않는다.

---

### Task 1: Markdown 게시글 링크 검사기와 회귀 테스트

**Files:**

- Create: \`scripts/check-internal-post-links.mjs\`
- Create: \`scripts/check-internal-post-links.test.mjs\`
- Modify: \`package.json:6-12\`

**Interfaces:**

- Consumes: \`content/posts/*.md\`의 파일명과 Markdown 본문.
- Produces: \`findMissingPostLinks(posts)\` 및 \`npm run check:internal-links\`.

- [ ] **Step 1: 누락 slug를 찾는 실패 테스트 작성**

\`\`\`js
import test from "node:test"
import assert from "node:assert/strict"
import { findMissingPostLinks } from "./check-internal-post-links.mjs"

test("존재하지 않는 게시글 slug를 내부 링크 오류로 보고한다", () => {
  const missing = findMissingPostLinks([
    { path: "content/posts/existing.md", content: "[누락 글](/posts/not-published)" },
    { path: "content/posts/other.md", content: "[존재 글](/posts/existing)" },
  ])

  assert.deepEqual(missing, [{
    path: "content/posts/existing.md",
    href: "/posts/not-published",
    slug: "not-published",
  }])
})
\`\`\`

- [ ] **Step 2: 실패를 확인한다**

Run: \`node --test scripts/check-internal-post-links.test.mjs\`

Expected: \`ERR_MODULE_NOT_FOUND\` 또는 \`findMissingPostLinks\` export 누락으로 실패한다.

- [ ] **Step 3: 최소 검사기를 구현한다**

\`\`\`js
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const postLinkPattern = /\[[^\]]*\]\(\/posts\/([^/?#)]+)(?:[?#][^)]*)?\)/g

export function findMissingPostLinks(posts) {
  const slugs = new Set(posts.map((post) => path.basename(post.path, ".md")))
  const missing = []

  for (const post of posts) {
    for (const match of post.content.matchAll(postLinkPattern)) {
      const slug = match[1]
      if (!slugs.has(slug)) missing.push({
        path: post.path,
        href: match[0].slice(match[0].lastIndexOf("(") + 1, -1),
        slug,
      })
    }
  }

  return missing
}

function run() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
  const postsDir = path.join(root, "content/posts")
  const posts = fs.readdirSync(postsDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const filePath = path.join(postsDir, file)
      return { path: path.relative(root, filePath), content: fs.readFileSync(filePath, "utf8") }
    })
  const missing = findMissingPostLinks(posts)

  if (missing.length > 0) {
    console.error("Missing internal post links:")
    for (const item of missing) console.error("- " + item.path + ": " + item.href)
    process.exitCode = 1
    return
  }

  console.log("Validated " + posts.length + " posts with no missing internal post links.")
}

if (process.argv[1] === fileURLToPath(import.meta.url)) run()
\`\`\`

Add this \`package.json\` script:

\`\`\`json
"check:internal-links": "node scripts/check-internal-post-links.mjs"
\`\`\`

- [ ] **Step 4: 테스트 통과를 확인한다**

Run: \`node --test scripts/check-internal-post-links.test.mjs\`

Expected: 1 test passed, 0 failed.

- [ ] **Step 5: 실제 콘텐츠 전체를 검사한다**

Run: \`npm run check:internal-links\`

Expected: 현재 4편 링크 때문에 \`spring-ai-guide-02-multi-provider.md: /posts/spring-ai-guide-04-production\`을 출력하고 종료 코드 1로 실패한다.

- [ ] **Step 6: 커밋한다**

\`\`\`bash
git add scripts/check-internal-post-links.mjs scripts/check-internal-post-links.test.mjs package.json
git commit -m "test: detect missing internal post links"
\`\`\`

### Task 2: Spring AI 4편 404 링크 수정

**Files:**

- Modify: \`content/posts/spring-ai-guide-02-multi-provider.md:118\`

**Interfaces:**

- Consumes: \`spring-ai-pipeline-real-world.md\` slug와 Bedrock 타임아웃 설정 설명.
- Produces: 존재하는 글만 가리키는 Spring AI 멀티 프로바이더 글.

- [ ] **Step 1: 수정 전 실패 상태를 재현한다**

Run: \`npm run check:internal-links\`

Expected: \`spring-ai-guide-02-multi-provider.md\`의 \`/posts/spring-ai-guide-04-production\` 누락 링크 때문에 실패한다.

- [ ] **Step 2: 링크를 실제 타임아웃 설명 글로 변경한다**

118행의 문장을 아래로 변경한다.

\`\`\`md
\`DefaultCredentialsProvider\`는 AWS의 기본 인증 체인(환경변수, EC2 인스턴스 프로파일, ECS 태스크 역할 등)을 따른다. 로컬에서는 \`~/.aws/credentials\`, 배포 환경에서는 IAM 역할을 자동으로 사용한다. 연결 및 소켓 타임아웃 설정은 [Spring AI 실전 적용기](/posts/spring-ai-pipeline-real-world/)에서 다룬다.
\`\`\`

- [ ] **Step 3: 링크 검사 통과를 확인한다**

Run: \`npm run check:internal-links\`

Expected: 종료 코드 0과 \`no missing internal post links\` 메시지.

- [ ] **Step 4: 전체 품질 검증을 실행한다**

Run: \`npm run type-check && npm run lint && npm run build && git diff --check\`

Expected: 모든 명령이 종료 코드 0으로 완료된다.

- [ ] **Step 5: 커밋한다**

\`\`\`bash
git add content/posts/spring-ai-guide-02-multi-provider.md
git commit -m "fix: replace missing Spring AI post link"
\`\`\`

### Task 3: Search Console 후속 점검 기록

**Files:**

- Create: \`docs/search-console/2026-07-12-triage.md\`

**Interfaces:**

- Consumes: Search Console 페이지 색인 보고서의 원인별 수와 확인된 URL.
- Produces: 다음 진단 시 재사용할 수 있는 조치 우선순위 기록.

- [ ] **Step 1: 조치 항목을 기록한다**

\`\`\`md
| 우선순위 | 항목 | 근거 | 조치 |
| --- | --- | --- | --- |
| P0 | 미발행 Spring AI 4편 내부 링크 | \`/posts/spring-ai-guide-04-production\`이 404이고 현재 글에서 링크됨 | 실제 운영 글 링크로 교체 |
| P1 | 크롤링/발견됐지만 미색인 13개 | Search Console의 \`크롤링됨\` 8개와 \`발견됨\` 5개 | URL 목록을 내보내어 콘텐츠별 검토 |
| P2 | 다른 표준 URL을 선택한 중복 31개 | Google 표준 선택 보고서 | 예시 URL의 canonical 및 내부 링크 대조 |
| 모니터링 | 리디렉션 108개, canonical 대체 83개 | trailing slash·태그 쿼리 URL | 현재 301/canonical 동작을 유지 |
\`\`\`

- [ ] **Step 2: 변경 범위를 확인한다**

Run: \`git diff --check && git status --short\`

Expected: 링크 검사기, 콘텐츠 링크, 진단 문서만 추적 대상 변경으로 보이며 기존 \`AGENTS.md\`는 미추적으로 유지된다.

- [ ] **Step 3: 커밋한다**

\`\`\`bash
git add docs/search-console/2026-07-12-triage.md
git commit -m "docs: record Search Console triage"
\`\`\`

