# Sitemap 최종 수정일 설계

## 목표

게시글 sitemap의 `lastmod`를 frontmatter의 명시적인 최종 수정일로 관리한다. 기존 `date` 값은 변경하지 않고, 모든 게시글에 초기 `updated`를 같은 값으로 추가한다. 앞으로 본문·구조화 데이터·주요 링크가 바뀐 글만 `updated`를 변경한다.

## 데이터 모델

- `date`: 최초 게시일이며 기존 값을 변경하지 않는다.
- `updated`: 필수 필드다. 최종 수정일을 `YYYY-MM-DD`로 기록한다.
- 처음 추가할 때는 기존 `date`와 같은 값을 사용하고, 이후 의미 있는 수정이 있을 때만 변경한다.
- `updated`는 `date`보다 빠르거나 미래일 수 없다.

기존 게시글 73개에는 현재 `date`와 동일한 `updated`를 명시적으로 추가한다. 따라서 현재 공개 게시글의 sitemap 날짜 값은 바뀌지 않는다.

## 출력 정책

- 게시글 sitemap `<lastmod>`: `updated`.
- 게시글 JSON-LD: `datePublished`에는 `date`, `dateModified`에는 `updated`.
- 게시글 화면: `updated`가 있고 `updated !== date`일 때만 수정일을 표시한다.
- 홈·글 목록·태그·시리즈·통계·소개·개인정보처리방침 같은 집계/고정 페이지: 신뢰할 수 없는 빌드 날짜를 넣지 않고 `<lastmod>`를 생략한다.
- RSS의 `<pubDate>`는 게시 시점을 뜻하므로 기존 `date`를 유지한다.

## 구현 경계

- 게시글 타입과 두 frontmatter 파서(`src/lib/posts.ts`, `vite.config.ts`)가 `updated`를 읽는다.
- sitemap 생성기는 URL 항목별로 `lastmod`를 선택적으로 출력한다.
- 서버 프리렌더 메타데이터와 JSON-LD에 `updated`를 전달한다.
- 기존 정렬은 게시일 기준을 유지한다. 수정된 글이 최신 글로 다시 올라오지 않는다.

## 검증

- 순수 날짜 선택/검증 로직을 Node 내장 테스트로 검증한다.
- 빌드 후 공개 게시글 URL의 `<lastmod>`가 `updated`인지 확인한다.
- 고정 페이지에 `<lastmod>`가 없는지 확인한다.
- 프리렌더 HTML의 `datePublished`와 `dateModified`를 확인한다.
- 기존 내부 링크 검사, 타입 검사, 린트, 전체 빌드를 실행한다.

## 비범위

- Git 커밋 시각이나 파일 시스템 mtime으로 수정일 자동 추론
- 기존 `date` 값 변경 또는 Git 이력 기반 수정일 추정
- Search Console의 의도된 NOINDEX 또는 리디렉션 정책 변경
