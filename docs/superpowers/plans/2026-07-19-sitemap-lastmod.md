# Sitemap 최종 수정일 구현 계획

**목표:** 기존 `date` 값은 유지하면서 모든 게시글에 같은 값의 필수 `updated`를 추가하고, sitemap·JSON-LD·화면에 일관되게 반영한다. 신뢰할 수 없는 고정/집계 페이지 빌드 날짜는 sitemap에서 제거한다.

## 1. 날짜 정책을 테스트로 고정

**파일**

- 추가: `src/lib/post-dates.ts`
- 추가: `scripts/post-dates.test.ts`
- 수정: `package.json`

**절차**

1. 필수 `updated`, 과거 `updated`, 미래 `updated`, 잘못된 날짜 형식을 검증하는 테스트를 먼저 작성한다.
2. 테스트가 구현 모듈 부재로 실패하는지 확인한다.
3. 날짜 선택·검증 순수 함수를 최소 구현한다.
4. Node 내장 테스트가 통과하는지 확인한다.

## 2. 게시글 메타데이터에 updated 추가

**파일**

- 수정: `src/types/post.ts`
- 수정: `src/lib/posts.ts`
- 수정: `vite.config.ts`

**절차**

1. `PostMeta`와 빌드용 게시글 타입에 필수 `updated`를 추가한다.
2. 런타임/빌드 frontmatter 파서가 `updated`를 읽도록 한다.
3. 빌드 단계에서 게시일과 수정일 정책을 검증해 잘못된 콘텐츠가 배포되지 않게 한다.
4. 기존 정렬과 RSS 게시일은 `date` 기준으로 유지한다.

## 3. sitemap 출력 수정

**파일**

- 수정: `vite.config.ts`
- 추가: `scripts/sitemap-lastmod.test.mjs`

**절차**

1. URL 엔트리가 `lastmod`를 선택적으로 출력하도록 바꾼다.
2. 게시글 URL은 `updated`를 출력한다.
3. 홈·목록·태그·시리즈·통계·소개·개인정보 페이지는 `lastmod`를 생략한다.
4. 빌드 결과의 모든 공개 게시글과 고정 페이지 정책을 검사하는 회귀 테스트를 추가한다.

## 4. JSON-LD와 화면 표시 일치

**파일**

- 수정: `src/entry-server.tsx`
- 수정: `src/pages/PostPage.tsx`
- 수정: `src/i18n/translations.ts`

**절차**

1. 게시글 JSON-LD의 `dateModified`를 `updated`로 출력한다.
2. `datePublished`는 기존 `date`를 유지한다.
3. `updated`가 실제 게시일과 다를 때만 한국어/영어 수정일 문구를 표시한다.

## 5. 전체 검증 및 인계

**명령**

- `npm run test:post-dates`
- `npm run build`
- `npm run test:sitemap-lastmod`
- `npm run check:internal-links`
- `npm run type-check`
- `npm run lint`
- `git diff --check`

빌드된 sitemap과 대표 게시글 HTML을 직접 검사해 `<lastmod>`, `datePublished`, `dateModified`가 설계와 일치하는지 확인한다. Search Console 재제출·재검증은 변경 사항이 실제 배포된 뒤 별도 승인 하에 수행한다.
