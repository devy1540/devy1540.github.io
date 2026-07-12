# Search Console 내부 링크 무결성 설계

## 목표

존재하지 않는 블로그 글을 가리키는 내부 링크를 제거하고, 이후 Markdown 글의 `/posts/:slug` 링크가 실제 게시 글과 일치하는지 빌드 전에 검증한다.

## 범위

- `spring-ai-guide-02-multi-provider.md`의 미발행 4편 링크를, 실제 타임아웃 설정을 다루는 `spring-ai-pipeline-real-world` 글 링크로 바꾼다.
- `content/posts/*.md`의 상대 사이트 내부 `/posts/:slug` 링크만 검사한다.
- 외부 링크, 앵커 링크, 쿼리 문자열, 다른 라우트 및 배포 인프라의 리디렉션은 검사 대상이 아니다.

## 설계

### 링크 수정

Spring AI 멀티 프로바이더 글은 Bedrock 타임아웃 설정의 후속 설명으로 실제 존재하는 `spring-ai-pipeline-real-world` 글을 참조한다. 이 글에는 `BedrockProxyChatModel`의 연결 및 소켓 타임아웃 설정이 포함돼 있어 원래 문맥과 일치한다.

### 링크 검사기

Node ESM 스크립트가 `content/posts`에서 Markdown 파일명을 읽어 유효 slug 집합을 만든다. 각 Markdown 본문에서 Markdown 링크 목적지 중 `/posts/:slug` 형식만 수집하고, slug가 집합에 없으면 파일명과 링크를 출력하고 비정상 종료한다.

검사기는 인수 없이 실행되며, 성공 시 검사한 파일 수와 내부 글 링크 수를 출력한다. `package.json`의 `check:internal-links` 스크립트로 노출하고, `npm run build` 전에 독립적으로 실행할 수 있게 한다.

## 오류 처리

- 누락된 slug가 하나라도 있으면 모든 누락 항목을 출력하고 종료 코드 1을 반환한다.
- 게시글 디렉터리를 읽지 못하면 원본 오류를 표시하고 종료한다.

## 검증

1. 존재하지 않는 `/posts/__missing-post__` 링크를 포함한 임시 Markdown 파일로 검사기가 실패하는지 확인한다.
2. 실제 문서의 링크만 남긴 뒤 검사기가 통과하는지 확인한다.
3. 타입 검사, lint, production build를 실행한다.

## 비범위

- Search Console에서 발견한 리디렉션·canonical 제외 URL의 자동 교정
- 새 Spring AI 4편 작성
- CDN 또는 호스팅 제공자의 5xx 원인 수정
- Google 색인 요청 또는 Search Console의 검증 버튼 실행
