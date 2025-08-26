# Contributing to Personal GitHub Blog

## 개발 환경 설정

### 필수 요구사항
- Node.js 22+
- npm 10+
- Git 2.0+

### 설치 및 실행
```bash
# 1. 저장소 클론
git clone https://github.com/YOUR_USERNAME/github-blog.git
cd github-blog

# 2. 의존성 설치
npm install

# 3. 개발 서버 시작
npm run dev

# 4. 새 브랜치 생성
git checkout -b feature/your-feature-name
```

## 코딩 컨벤션

### TypeScript
- 모든 타입은 `src/types`에 정의하고 import하여 사용
- `any` 타입 사용 금지 - 적절한 타입 정의 필수
- 함수 반환 타입 명시적 선언
- 매개변수 타입 검증 강화

### React 컴포넌트
- 모든 컴포넌트는 **named export** 사용
- PascalCase 네이밍 컨벤션
- Props 인터페이스는 컴포넌트명 + `Props` 접미사
- 함수형 컴포넌트 사용

```typescript
interface UserProfileProps {
  user: User;
  onEdit?: (user: User) => void;
}

export const UserProfile: FC<UserProfileProps> = ({ user, onEdit }) => {
  // 컴포넌트 구현
};
```

### Hooks
- camelCase + 'use' 접두사
- 의존성 배열 정확히 명시
- 커스텀 훅은 `src/hooks`에 위치

### 상태 관리
- 직접 상태 변경 금지 - 불변성 유지
- Zustand 스토어 사용
- 상태 업데이트는 액션 함수를 통해서만

### API 호출
- 직접 HTTP 호출 금지 - 항상 service 레이어 사용
- `src/services`에 API 클라이언트 위치
- 에러 처리 표준화

### 에러 처리
- 모든 API 에러는 표준 에러 핸들러로 처리
- try-catch 블록에서 error 변수 미사용시 생략
- console.error 대신 로깅 시스템 사용

## 테스트 작성 가이드라인

### 테스트 구조
```
src/
├── components/
│   ├── ComponentName.tsx
│   └── __tests__/
│       └── ComponentName.test.tsx
├── hooks/
│   ├── useHookName.ts
│   └── __tests__/
│       └── useHookName.test.ts
└── utils/
    ├── utilFunction.ts
    └── __tests__/
        └── utilFunction.test.ts
```

### 테스트 작성 원칙
1. **Arrange-Act-Assert** 패턴 사용
2. **사용자 중심 테스트** - 구현 세부사항이 아닌 동작 테스트
3. **의미 있는 테스트 이름** - "should ... when ..." 패턴
4. **독립적인 테스트** - 테스트 간 의존성 없음

### 컴포넌트 테스트
```typescript
describe('UserProfile', () => {
  it('should display user information correctly', () => {
    const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com' };
    
    render(<UserProfile user={mockUser} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', async () => {
    const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com' };
    const mockOnEdit = vi.fn();
    
    render(<UserProfile user={mockUser} onEdit={mockOnEdit} />);
    
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockUser);
  });
});
```

### 테스트 커버리지 목표
- 전체 커버리지: 80% 이상
- 핵심 비즈니스 로직: 95% 이상
- UI 컴포넌트: 85% 이상
- 유틸리티 함수: 90% 이상

## 커밋 메시지 컨벤션

### 기본 형식
```
<type>(<scope>): <subject>

<body>

<footer>
```

### 타입
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포맷팅 (로직 변경 없음)
- `refactor`: 리팩토링
- `perf`: 성능 개선
- `test`: 테스트 추가/수정
- `chore`: 빌드 도구, 패키지 매니저 설정

### 예시
```
feat(auth): add GitHub OAuth authentication

- Add GitHub OAuth login flow
- Implement token refresh mechanism
- Add user session management

Closes #123
```

## 품질 검사

### 개발 중 검사
```bash
# 타입 검사
npm run type-check

# 린트 검사
npm run lint

# 포맷 검사
npm run format:check

# 테스트 실행
npm run test

# 모든 검사 실행
npm run lint && npm run type-check && npm run test
```

### Pre-commit Hook
커밋 시 자동으로 다음이 실행됩니다:
1. 변경된 파일에 대해 Prettier 포맷팅 적용
2. ESLint로 코드 품질 검사
3. TypeScript 타입 검사

### CI/CD 파이프라인
PR 생성 및 main 브랜치 push 시:
1. 타입 검사
2. 린트 검사
3. 포맷 검사
4. 테스트 실행
5. 빌드 검증

## 브랜치 전략

### 브랜치 네이밍
- `feature/feature-name`: 새 기능 개발
- `fix/issue-name`: 버그 수정
- `docs/update-name`: 문서 업데이트
- `refactor/component-name`: 리팩토링

### 워크플로우
1. `main`에서 새 브랜치 생성
2. 기능 개발 및 테스트 작성
3. 모든 품질 검사 통과 확인
4. PR 생성
5. 코드 리뷰 후 merge

## 의존성 관리

### 새 패키지 추가 시
1. 필요성 검토 - 기존 패키지로 해결 가능한지 확인
2. 패키지 크기 및 유지보수성 검토
3. TypeScript 지원 여부 확인
4. 보안 취약점 검사

### 업데이트
- 정기적인 의존성 업데이트 (월 1회)
- 보안 패치는 즉시 적용
- 주요 버전 업데이트 시 충분한 테스트

## 성능 가이드라인

### 번들 크기
- 전체 번들 크기: 200KB 이하 (gzipped)
- 코드 스플리팅으로 필요한 부분만 로드
- Tree shaking으로 미사용 코드 제거

### 렌더링 최적화
- `React.memo`, `useMemo`, `useCallback` 적절히 사용
- 불필요한 리렌더링 방지
- 리스트 렌더링 시 적절한 `key` 사용

### 이미지 최적화
- WebP 포맷 사용
- 적절한 크기로 리사이징
- lazy loading 적용

## 접근성 (Accessibility)

### WCAG 2.1 AA 준수
- 모든 인터랙티브 요소에 적절한 ARIA 레이블
- 키보드 네비게이션 지원
- 충분한 색상 대비
- 스크린 리더 호환성

### 테스트
- `jest-axe`를 사용한 자동화된 접근성 테스트
- 키보드만으로 모든 기능 접근 가능 확인
- 스크린 리더 테스트

## 문제 해결

### 자주 발생하는 문제

#### ESLint 오류
```bash
# 자동 수정 가능한 오류들 수정
npm run lint

# 수동 수정이 필요한 경우
npm run lint:check
```

#### 타입 오류
```bash
# 타입 검사
npm run type-check

# 일반적인 해결책:
# 1. 적절한 타입 정의 추가
# 2. any 타입 대신 구체적 타입 사용
# 3. 타입 가드 함수 활용
```

#### 테스트 실패
```bash
# 단일 테스트 파일 실행
npm run test -- ComponentName.test.tsx

# watch 모드로 개발
npm run test:watch

# 커버리지 확인
npm run test:coverage
```

## 도움 요청

문제가 발생하거나 질문이 있을 때:

1. **문서 먼저 확인** - 이 가이드와 README.md
2. **기존 코드 참조** - 비슷한 구현 사례 찾기
3. **이슈 생성** - GitHub Issues에 상세한 정보와 함께
4. **PR에서 질문** - 리뷰 과정에서 토론

---

이 가이드는 프로젝트가 발전함에 따라 계속 업데이트됩니다. 개선 사항이 있다면 언제든 제안해 주세요!