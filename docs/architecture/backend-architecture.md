# Backend Architecture

## Service Architecture

### GitHub as Backend 구조
```
GitHub 백엔드 레이어
├── GitHub API                 # 데이터 CRUD
├── GitHub OAuth              # 인증/인가
├── GitHub Actions            # 자동화/배포
└── GitHub Pages             # 정적 호스팅
```

## Database Architecture

### Data Access Layer
```typescript
abstract class BaseRepository<T> {
  protected abstract path: string;
  protected cache: Map<string, CacheEntry<T>> = new Map();
  
  protected async fetchFromGitHub(filename?: string): Promise<T | T[]> {
    // Implementation
  }
  
  abstract findAll(): Promise<T[]>;
  abstract findById(id: string): Promise<T | null>;
  abstract create(data: Omit<T, 'id'>): Promise<T>;
  abstract update(id: string, data: Partial<T>): Promise<T>;
  abstract delete(id: string): Promise<void>;
}
```

## Authentication and Authorization

### Auth Flow
OAuth 2.0 플로우를 통한 GitHub 인증

### Middleware/Guards
```typescript
export class AuthGuard {
  async canActivate(requiredRole: 'user' | 'admin' = 'user'): Promise<boolean> {
    // Implementation
  }
  
  async interceptRequest(config: any): Promise<any> {
    // Add auth headers
  }
  
  async interceptError(error: any): Promise<void> {
    // Handle auth errors
  }
}
```
