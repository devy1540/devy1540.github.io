# Epic 4: GitHub 인증 시스템 개선 - Brownfield Enhancement

## Epic Goal

GitHub Personal Access Token 방식 외에 GitHub Device Flow 인증을 추가하여 사용자가 PAT 생성 없이도 GitHub 계정으로 직접 로그인할 수 있도록 하고, 두 방식을 병행 지원하여 사용자 선택권을 제공한다.

## Epic Description

### Existing System Context:

- **Current relevant functionality**: GitHub Personal Access Token 기반 인증 시스템 (Epic 3.1에서 구현됨)
- **Technology stack**: React, TypeScript, Zustand, GitHub API, Octokit, CryptoJS (토큰 암호화)
- **Integration points**: GitHubAuthService, useGitHubAuthStore, localStorage 토큰 관리, GitHub API Rate Limit 처리

### Enhancement Details:

- **What's being added/changed**: GitHub Device Flow 인증 방식 추가, 인증 방식 선택 UI 제공, 기존 PAT 방식과 병행 지원
- **How it integrates**: 기존 GitHubAuthService 확장, Auth Store에 Device Flow 상태 추가, 기존 토큰 관리 로직 재사용
- **Success criteria**: 
  - 사용자가 GitHub 계정으로 직접 로그인 가능
  - 기존 PAT 사용자에게 영향 없음
  - 두 인증 방식 간 원활한 전환 가능
  - Device Flow 진행 상황 명확히 안내

## Stories

1. **Story 4.1**: Device Flow 인증 서비스 구현 - GitHubAuthService에 startDeviceFlow, pollForToken 메서드 추가 및 Auth Store 통합
2. **Story 4.2**: Device Flow UI 컴포넌트 구현 - 사용자 친화적인 Device Flow 로그인 인터페이스 및 진행 상황 표시
3. **Story 4.3**: 인증 방식 선택 UI 개선 - PAT와 Device Flow 중 선택할 수 있는 통합 로그인 옵션 제공

## Compatibility Requirements

- [x] Existing APIs remain unchanged - GitHubAuthService의 기존 메서드들 유지
- [x] Database schema changes are backward compatible - localStorage 기반으로 스키마 변경 없음
- [x] UI changes follow existing patterns - Shadcn UI 컴포넌트 패턴 및 GitHub 브랜딩 유지
- [x] Performance impact is minimal - 추가 API 호출 최소화, 기존 토큰 관리 로직 재사용

## Risk Mitigation

- **Primary Risk**: 기존 Personal Access Token 사용자의 워크플로우 중단
- **Mitigation**: PAT 방식을 완전히 유지하면서 Device Flow를 추가 옵션으로만 제공
- **Rollback Plan**: Device Flow 관련 컴포넌트 비활성화하여 기존 PAT 전용 모드로 복원

## Definition of Done

- [x] All stories completed with acceptance criteria met
- [x] Existing functionality verified through testing - 기존 PAT 인증 플로우 회귀 테스트
- [x] Integration points working correctly - GitHub API 서비스와 Auth Store 통합 검증  
- [x] Documentation updated appropriately - README 및 사용자 가이드 업데이트
- [x] No regression in existing features - 기존 사용자에게 영향 없음

## Validation Checklist

### Scope Validation:
- [x] Epic can be completed in 1-3 stories maximum ✅
- [x] No architectural documentation is required ✅  
- [x] Enhancement follows existing patterns ✅
- [x] Integration complexity is manageable ✅

### Risk Assessment:
- [x] Risk to existing system is low ✅
- [x] Rollback plan is feasible ✅
- [x] Testing approach covers existing functionality ✅
- [x] Team has sufficient knowledge of integration points ✅

### Completeness Check:
- [x] Epic goal is clear and achievable ✅
- [x] Stories are properly scoped ✅  
- [x] Success criteria are measurable ✅
- [x] Dependencies are identified ✅

---

## Story Manager Handoff:

"Please develop detailed user stories for this brownfield epic. Key considerations:

- This is an enhancement to an existing system running React, TypeScript, Zustand, GitHub API, Octokit
- Integration points: GitHubAuthService, useGitHubAuthStore, localStorage 토큰 관리, GitHub API Rate Limit 처리
- Existing patterns to follow: CryptoJS 토큰 암호화, Zustand 상태 관리, Shadcn UI 컴포넌트, 에러 처리 및 토스트 알림
- Critical compatibility requirements: 기존 PAT 인증 방식 완전 유지, 토큰 관리 로직 재사용, 기존 권한 확인 플로우 통합
- Each story must include verification that existing functionality remains intact

The epic should maintain system integrity while delivering GitHub Device Flow 인증을 통한 향상된 사용자 경험."