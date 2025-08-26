# Frontend Architecture

## Component Architecture

### Component Organization
```
src/
├── components/           # 재사용 가능한 UI 컴포넌트
│   ├── ui/              # Shadcn UI 컴포넌트
│   ├── layout/          # 레이아웃 컴포넌트
│   ├── post/            # 포스트 관련 컴포넌트
│   ├── editor/          # 에디터 관련 컴포넌트
│   ├── auth/            # 인증 관련 컴포넌트
│   └── common/          # 공통 컴포넌트
├── pages/               # 페이지 컴포넌트
├── hooks/               # 커스텀 훅
├── services/            # API 서비스
├── stores/              # Zustand 스토어
├── utils/               # 유틸리티 함수
└── types/               # TypeScript 타입 정의
```

### Component Template
```typescript
import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Post } from '@/types/post';

interface PostCardProps {
  post: Post;
  showAdminControls?: boolean;
  onEdit?: (post: Post) => void;
  onDelete?: (post: Post) => void;
}

export const PostCard: FC<PostCardProps> = ({ 
  post, 
  showAdminControls = false,
  onEdit,
  onDelete 
}) => {
  // Component implementation
};
```

## State Management Architecture

### State Structure
```typescript
interface AppState {
  auth: {
    user: User | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isLoading: boolean;
  };
  posts: {
    items: Post[];
    currentPost: Post | null;
    isLoading: boolean;
    error: string | null;
    filters: {
      category: string | null;
      tags: string[];
      search: string;
    };
  };
  editor: {
    content: string;
    metadata: Partial<Post>;
    isDirty: boolean;
    isAutoSaving: boolean;
    lastSaved: Date | null;
    preview: boolean;
  };
  ui: {
    theme: 'light' | 'dark' | 'system';
    sidebarOpen: boolean;
    toasts: Toast[];
  };
}
```

### State Management Patterns
- **Atomic Updates**: 각 스토어는 독립적으로 업데이트
- **Optimistic Updates**: UI 먼저 업데이트 후 API 호출
- **Middleware**: 로깅, 에러 처리, 캐싱
- **Persistence**: 특정 상태는 localStorage에 저장

## Routing Architecture

### Route Organization
```
/                      # 홈 (포스트 목록)
/post/:slug           # 포스트 상세
/category/:category   # 카테고리별 포스트
/tag/:tag            # 태그별 포스트
/about               # About 페이지
/editor              # 새 포스트 작성 (보호됨)
/editor/:slug        # 포스트 수정 (보호됨)
/settings            # 설정 (보호됨)
/login               # GitHub OAuth 로그인
/404                 # Not Found
```

### Protected Route Pattern
```typescript
export const ProtectedRoute: FC<ProtectedRouteProps> = ({ 
  requireAdmin = false,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  
  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to={redirectTo} replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />;
  
  return <Outlet />;
};
```

## Frontend Services Layer

### API Client Setup
```typescript
class APIClient {
  private octokit: Octokit | null = null;
  
  async request<T>(endpoint: string, options?: any): Promise<T> {
    const client = this.getClient();
    const response = await client.request(endpoint, options);
    return response.data;
  }
}
```

### Service Example
```typescript
export class PostService {
  async getPosts(): Promise<Post[]> {
    // Implementation
  }
  
  async createPost(post: Omit<Post, 'id'>): Promise<Post> {
    // Implementation
  }
}
```
