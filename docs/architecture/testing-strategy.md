# Testing Strategy

## Testing Pyramid
- Unit Tests: 60%
- Integration Tests: 30%
- E2E Tests: 10%

## Test Organization
```
tests/
├── unit/                         # 단위 테스트
├── integration/                  # 통합 테스트
└── e2e/                         # E2E 테스트
```

## Test Examples

### Frontend Component Test
```typescript
describe('PostCard', () => {
  it('should render post information correctly', () => {
    // Test implementation
  });
});
```

### Backend API Test
```typescript
describe('GitHubService', () => {
  describe('getPosts', () => {
    it('should fetch and parse posts correctly', async () => {
      // Test implementation
    });
  });
});
```

## 테스트 커버리지 목표
- 비즈니스 로직: 90%+
- UI 컴포넌트: 80%+
- 유틸리티 함수: 95%+
- 서비스 레이어: 85%+
