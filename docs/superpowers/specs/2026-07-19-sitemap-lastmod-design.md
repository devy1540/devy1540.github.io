# Sitemap 최종 수정일 설계

## 목표

게시글 sitemap의 `lastmod`를 실제 의미 있는 최종 수정일로 관리한다. 현재 게시글은 사용자의 결정에 따라 `date`를 최종 수정일로 간주하고, 앞으로 본문·구조화 데이터·주요 링크가 바뀐 글만 선택적으로 `updated`를 기록한다.

## 데이터 모델

- `date`: 최초 게시일이자 `updated`가 없을 때의 최종 수정일이다.
- `updated`: 선택 필드다. 의미 있는 수정이 있을 때만 `YYYY-MM-DD`로 기록한다.
- 최종 수정일은 `updated ?? date`로 계산한다.
- `updated`는 `date`보다 빠르거나 미래일 수 없다.

기존 게시글은 backfill하지 않는다. 따라서 현재 공개 게시글의 sitemap 값은 그대로 유지된다.

## 출력 정책

- 게시글 sitemap `<lastmod>`: `updated ?? date`.
- 게시글 JSON-LD: `datePublished`에는 `date`, `dateModified`에는 `updated ?? date`.
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
- 빌드 후 공개 게시글 URL의 `<lastmod>`가 `updated ?? date`인지 확인한다.
- 고정 페이지에 `<lastmod>`가 없는지 확인한다.
- 프리렌더 HTML의 `datePublished`와 `dateModified`를 확인한다.
- 기존 내부 링크 검사, 타입 검사, 린트, 전체 빌드를 실행한다.

## 비범위

- Git 커밋 시각이나 파일 시스템 mtime으로 수정일 자동 추론
- 기존 게시글의 수정일 일괄 추정/backfill
- Search Console의 의도된 NOINDEX 또는 리디렉션 정책 변경
