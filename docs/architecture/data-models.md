# Data Models

## Post (블로그 포스트 - 초안 포함)
**Purpose:** 블로그의 핵심 콘텐츠 단위로, 마크다운으로 작성된 글을 표현 (초안과 게시글 통합 관리)

**Key Attributes:**
- id: string - 고유 식별자 (slug 기반)
- title: string - 포스트 제목
- content: string - 마크다운 콘텐츠
- excerpt: string - 포스트 요약 (목록 표시용)
- slug: string - URL 경로용 식별자
- isDraft: boolean - 초안 여부
- publishedAt: Date | null - 발행 날짜 (draft면 null)
- createdAt: Date - 최초 작성 날짜
- updatedAt: Date - 마지막 수정 날짜
- category: string - 카테고리 ID
- tags: string[] - 태그 ID 배열
- thumbnail: string | null - 썸네일 이미지 URL
- readingTime: number - 예상 읽기 시간 (분)
- metadata: object - SEO 메타데이터

### TypeScript Interface
```typescript
interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  isDraft: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  category: string;
  tags: string[];
  thumbnail: string | null;
  readingTime: number;
  metadata: {
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
  };
}
```

### Relationships
- Many-to-One with Category
- Many-to-Many with Tags

## Category (카테고리)
**Purpose:** 포스트를 주제별로 그룹화하는 분류 체계

**Key Attributes:**
- id: string - 고유 식별자
- name: string - 카테고리 이름
- slug: string - URL 경로용 식별자
- description: string - 카테고리 설명
- postCount: number - 게시된 포스트 개수 (초안 제외)

### TypeScript Interface
```typescript
interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  postCount: number;
}
```

### Relationships
- One-to-Many with Posts

## Tag (태그)
**Purpose:** 포스트에 대한 세부 주제 키워드

**Key Attributes:**
- id: string - 고유 식별자
- name: string - 태그 이름
- slug: string - URL 경로용 식별자
- postCount: number - 연결된 게시 포스트 개수 (초안 제외)

### TypeScript Interface
```typescript
interface Tag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}
```

### Relationships
- Many-to-Many with Posts

## User (사용자)
**Purpose:** GitHub OAuth로 인증된 사용자 정보

**Key Attributes:**
- id: number - GitHub user ID
- username: string - GitHub username
- name: string - 사용자 이름
- email: string - 이메일
- avatarUrl: string - 프로필 이미지 URL
- accessToken: string - GitHub API 액세스 토큰

### TypeScript Interface
```typescript
interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  avatarUrl: string;
  accessToken: string;
  repos: Repository[];
}

interface Repository {
  name: string;
  fullName: string;
  private: boolean;
  defaultBranch: string;
}
```

### Relationships
- One-to-Many with Repositories

## StaticPage (정적 페이지)
**Purpose:** About, Portfolio 등의 정적 콘텐츠 페이지

**Key Attributes:**
- id: string - 고유 식별자
- title: string - 페이지 제목
- slug: string - URL 경로
- content: string - 마크다운 콘텐츠
- updatedAt: Date - 마지막 수정 날짜

### TypeScript Interface
```typescript
interface StaticPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  updatedAt: Date;
  isEditable: boolean;
}
```

### Relationships
- Standalone
