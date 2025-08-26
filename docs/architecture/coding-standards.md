# Coding Standards

## Critical Fullstack Rules
- **Type Sharing:** 모든 타입은 src/types에 정의하고 import하여 사용
- **API Calls:** 직접 HTTP 호출 금지 - 항상 service 레이어 사용
- **Environment Variables:** process.env 직접 접근 금지 - config 객체만 사용
- **Error Handling:** 모든 API 에러는 표준 에러 핸들러로 처리
- **State Updates:** 상태 직접 변경 금지 - 불변성 유지
- **Component Exports:** 모든 컴포넌트는 named export 사용
- **Async/Await:** Promise 체이닝 대신 async/await 사용
- **Early Returns:** 중첩 대신 early return으로 가독성 향상

## Naming Conventions

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| Components | PascalCase | - | `UserProfile.tsx` |
| Hooks | camelCase with 'use' | - | `useAuth.ts` |
| Constants | UPPER_SNAKE_CASE | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Functions | camelCase | camelCase | `getUserById()` |
| Types/Interfaces | PascalCase | PascalCase | `UserProfile` |
| File Names | PascalCase/camelCase | camelCase | `PostCard.tsx` |
