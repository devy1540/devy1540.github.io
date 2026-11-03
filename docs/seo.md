# 공통 SEO 처리

React/Vite와 hydrated SSG 구조를 유지한다. Jekyll SEO Tag의 사이트 기본값 + 페이지별 정보 패턴을 참고하며, 테마나 플러그인 자체는 추가하지 않는다.

## 생성 규칙

- `src/lib/seo.ts`: 사이트 이름·기본 설명·이미지, canonical 정규화, 메타태그, hreflang, 언어별 RSS 링크의 공통 규칙.
- `src/lib/page-seo.ts`: 홈·글 목록·태그·시리즈·소개 등 고정 페이지의 제목·설명·언어 연결을 공유한다.
- `src/lib/post-seo.ts`: 게시글 제목·설명·발행일·수정일·실제 번역 연결을 서버와 클라이언트에서 공유한다.
- `src/hooks/useMetaTags.ts`: 같은 규칙을 클라이언트 이동에 적용한다. 이전 페이지의 관리 대상 태그를 교체하며 구조화 데이터는 React 페이지가 소유한다.
- `src/entry-server.tsx`: 프리렌더할 경로와 발행된 글 목록을 제공한다.
- `scripts/prerender.mjs`: 공통 규칙으로 초기 HTML을 만들고 동일한 경로 목록에서 사이트맵과 언어별 RSS를 생성한다. Vite 설정에서 별도로 Markdown을 파싱하지 않는다.
- `src/lib/structured-data.ts`: 공통 사이트 설정을 사용해 글·블로그·프로젝트의 구조화 데이터를 생성한다.

사이트맵에는 noindex 경로를 넣지 않는다. 초안·예약 글·미번역 안내는 발행 목록에서 제외하며, hreflang에는 실제로 발행된 언어만 연결한다. canonical은 후행 슬래시를 통일하고 fragment를 제거한다. 기존 필터 쿼리의 noindex 정책은 유지한다.

RSS에는 게시글만 넣는다. 게시글의 최초 발행일과 실제 수정일은 보존한다. 고정 페이지의 수정일은 `src/data/page-updates.ts`에 명시하며 빌드 시간으로 갱신하지 않는다. 기존 시리즈·태그·홈의 읽기 가이드와 관련 글 탐색을 유지한다.

## 검증

`pnpm build` 후 `pnpm test:seo`, `pnpm test:sitemap-lastmod`, `pnpm check:internal-links`를 실행한다. 이동·언어·hydration 변경은 `pnpm test:browser`로 확인한다. SEO 검사는 사이트맵과 HTML의 canonical·언어 연결 일치, RSS와 발행 글의 일치, 게시글 날짜와 구조화 데이터의 일치를 확인한다. 브라우저 검사는 초기 HTML과 hydration 후 메타정보, 글 이동, 언어 전환과 없는 주소의 404를 확인한다.

검사 통과는 Google 색인이나 순위 상승을 뜻하지 않는다. 배포 후에는 Search Console의 Google 선택 canonical, 색인 상태, 검색 노출과 클릭을 별도로 확인한다. 색인 요청은 자동 제출하지 않는다.

참고: [Jekyll SEO Tag](https://github.com/jekyll/jekyll-seo-tag), [Jekyll Sitemap](https://github.com/jekyll/jekyll-sitemap), [Google canonical 안내](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [다국어 연결 안내](https://developers.google.com/search/docs/specialty/international/localized-versions).
