# API Specification

## GitHub API 활용 전략

**Base URL:** `https://api.github.com`  
**Authentication:** Bearer Token (OAuth Access Token)  
**Version:** v3 (REST API)

## 주요 API 엔드포인트 매핑

### 포스트 관련 작업

| 작업 | GitHub API 엔드포인트 | 메서드 | 용도 |
|-----|---------------------|--------|------|
| 포스트 목록 조회 | `/repos/{owner}/{repo}/contents/content/posts` | GET | 모든 포스트 파일 목록 |
| 포스트 상세 조회 | `/repos/{owner}/{repo}/contents/content/posts/{slug}.md` | GET | 특정 포스트 내용 |
| 포스트 생성 | `/repos/{owner}/{repo}/contents/content/posts/{slug}.md` | PUT | 새 포스트 작성 |
| 포스트 수정 | `/repos/{owner}/{repo}/contents/content/posts/{slug}.md` | PUT | 기존 포스트 업데이트 |
| 포스트 삭제 | `/repos/{owner}/{repo}/contents/content/posts/{slug}.md` | DELETE | 포스트 삭제 |

### 이미지 업로드

| 작업 | GitHub API 엔드포인트 | 메서드 | 용도 |
|-----|---------------------|--------|------|
| 이미지 업로드 | `/repos/{owner}/{repo}/contents/public/images/{filename}` | PUT | 이미지 파일 업로드 |

## API 서비스 레이어 구조

```typescript
// services/github-api.service.ts
interface GitHubAPIService {
  // 인증
  authenticate(token: string): void;
  
  // 포스트 CRUD
  getPosts(): Promise<Post[]>;
  getPost(slug: string): Promise<Post>;
  createPost(post: Omit<Post, 'id'>): Promise<Post>;
  updatePost(slug: string, post: Partial<Post>): Promise<Post>;
  deletePost(slug: string): Promise<void>;
  
  // 이미지 관리
  uploadImage(file: File): Promise<string>;
  
  // 저장소 정보
  getRepository(): Promise<Repository>;
  getRateLimit(): Promise<RateLimit>;
}
```
