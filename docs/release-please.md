# Release Please

자동 릴리즈 노트 및 버전 관리 시스템.

## 개요

[Release Please](https://github.com/googleapis/release-please)는 Conventional Commits를 분석하여 버전 bump, CHANGELOG 생성, GitHub Release를 자동화한다.

## 관련 파일

| 파일 | 역할 |
|------|------|
| `.github/workflows/release-please.yml` | GitHub Actions 워크플로우 |
| `release-please-config.json` | Release Please 설정 (릴리즈 타입, CHANGELOG 섹션) |
| `.release-please-manifest.json` | 현재 버전 추적 |

## 버저닝 규칙

[Semantic Versioning](https://semver.org/) 기반으로 커밋 prefix에 따라 자동 결정된다.

| 커밋 prefix | 버전 bump | 예시 (`0.1.0` 기준) |
|---|---|---|
| `fix:` | PATCH | `0.1.0` → `0.1.1` |
| `docs:`, `style:`, `refactor:`, `perf:`, `test:` | PATCH | `0.1.0` → `0.1.1` |
| `feat:` | MINOR | `0.1.0` → `0.2.0` |
| `feat!:` 또는 `BREAKING CHANGE` footer | MAJOR | `0.1.0` → `1.0.0` |

- 여러 타입의 커밋이 섞여 있으면 **가장 높은 bump 레벨**이 적용된다.
- `chore:` 커밋은 CHANGELOG에 표시되지 않는다 (`hidden: true`).

## 동작 흐름

```
main에 push
    ↓
Release Please가 커밋 분석
    ↓
릴리즈할 변경사항이 있으면 Release PR 자동 생성
  - package.json 버전 bump
  - CHANGELOG.md 업데이트
  - .release-please-manifest.json 업데이트
    ↓
Release PR 머지
    ↓
GitHub Release 생성 + git tag (v0.2.0 등)
```

## CHANGELOG 섹션

`release-please-config.json`에서 커밋 타입별 한국어 섹션명을 정의한다.

| 커밋 타입 | CHANGELOG 섹션 | 표시 여부 |
|---|---|---|
| `feat` | 새로운 기능 | O |
| `fix` | 버그 수정 | O |
| `docs` | 문서 | O |
| `style` | 스타일 | O |
| `refactor` | 리팩터링 | O |
| `perf` | 성능 개선 | O |
| `test` | 테스트 | O |
| `chore` | 기타 | X (hidden) |

## 배포와의 관계

Release Please는 릴리즈 관리만 담당하며, 배포(`deploy.yml`)와는 독립적으로 동작한다.

```
main push → deploy.yml (GitHub Pages 배포)
main push → release-please.yml (릴리즈 PR 생성/릴리즈 발행)
```
