import type { 
  GitHubCommitInfo,
  FileOperationOptions,
  GitHubRepository,
} from '@/types/github';
import { GitHubApiService } from './github-api';

export interface ContentFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: 'file' | 'dir';
  content?: string;
  lastModified?: string;
  downloadUrl?: string;
}

export interface ContentDirectory {
  path: string;
  files: ContentFile[];
  subdirectories: string[];
}

export interface PostMetadata {
  title?: string;
  description?: string;
  author?: string;
  date?: string;
  tags?: string[];
  category?: string;
  draft?: boolean;
}

export interface BlogPost extends ContentFile {
  metadata: PostMetadata;
  excerpt?: string;
  readingTime?: number;
}

export class GitHubContentService {
  private apiService: GitHubApiService;
  private currentRepo: GitHubRepository | null = null;

  constructor(apiService: GitHubApiService) {
    this.apiService = apiService;
  }

  /**
   * 현재 작업 중인 저장소 설정
   */
  setCurrentRepository(repo: GitHubRepository): void {
    this.currentRepo = repo;
  }

  /**
   * 저장소 정보 가져오기
   */
  getCurrentRepository(): GitHubRepository | null {
    return this.currentRepo;
  }

  /**
   * content 폴더 구조 파악
   */
  private getOwnerAndRepo(): { owner: string; repo: string } {
    if (!this.currentRepo) {
      throw new Error('No repository selected. Please set a current repository first.');
    }

    const [owner, repo] = this.currentRepo.full_name.split('/');
    return { owner, repo };
  }

  /**
   * /content 폴더의 파일 목록 조회
   */
  async getContentDirectoryListing(path: string = 'content'): Promise<ContentDirectory> {
    const { owner, repo } = this.getOwnerAndRepo();
    
    try {
      const items = await this.apiService.getDirectoryContents(owner, repo, path);
      
      const files: ContentFile[] = [];
      const subdirectories: string[] = [];

      for (const item of items) {
        if (item.type === 'file') {
          files.push({
            name: item.name,
            path: item.path,
            sha: item.sha,
            size: item.size,
            type: 'file',
            downloadUrl: item.download_url || undefined,
          });
        } else if (item.type === 'dir') {
          subdirectories.push(item.name);
        }
      }

      return {
        path,
        files,
        subdirectories,
      };
    } catch (error) {
      if (error instanceof Error && 'status' in error && (error as any).status === 404) {
        // content 폴더가 없으면 빈 구조 반환
        return {
          path,
          files: [],
          subdirectories: [],
        };
      }
      console.error(`Failed to get content directory listing for ${path}:`, error);
      throw error;
    }
  }

  /**
   * 재귀적으로 content 디렉토리 탐색
   */
  async getAllContentFiles(basePath: string = 'content'): Promise<GitHubFileMetadata[]> {
    const { owner, repo } = this.getOwnerAndRepo();
    
    try {
      return await this.apiService.getDirectoryContentsRecursive(owner, repo, basePath);
    } catch (error) {
      if (error instanceof Error && 'status' in error && (error as any).status === 404) {
        return [];
      }
      console.error(`Failed to get all content files from ${basePath}:`, error);
      throw error;
    }
  }

  /**
   * 특정 파일 내용 읽기
   */
  async getFileContent(filePath: string): Promise<ContentFile> {
    const { owner, repo } = this.getOwnerAndRepo();
    
    const fileContent = await this.apiService.getFileContent(owner, repo, filePath);
    const decodedContent = await this.apiService.getDecodedFileContent(owner, repo, filePath);
    
    return {
      name: fileContent.name,
      path: fileContent.path,
      sha: fileContent.sha,
      size: fileContent.size,
      type: 'file',
      content: decodedContent,
      downloadUrl: fileContent.download_url || undefined,
    };
  }

  /**
   * 포스트 파일 목록 조회 (content/posts 폴더)
   */
  async getBlogPosts(): Promise<BlogPost[]> {
    try {
      const postsDirectory = await this.getContentDirectoryListing('content/posts');
      const blogPosts: BlogPost[] = [];

      for (const file of postsDirectory.files) {
        if (file.name.endsWith('.md') || file.name.endsWith('.mdx')) {
          try {
            const contentFile = await this.getFileContent(file.path);
            const metadata = this.extractPostMetadata(contentFile.content || '');
            const excerpt = this.extractExcerpt(contentFile.content || '');
            const readingTime = this.calculateReadingTime(contentFile.content || '');

            blogPosts.push({
              ...contentFile,
              metadata,
              excerpt,
              readingTime,
            });
          } catch (error) {
            console.warn(`Failed to load post ${file.path}:`, error);
            // 메타데이터 추출 실패 시 기본값으로 포스트 추가
            blogPosts.push({
              ...file,
              metadata: {
                title: file.name.replace(/\.(md|mdx)$/, ''),
                draft: true,
              },
            });
          }
        }
      }

      return blogPosts.sort((a, b) => {
        const dateA = new Date(a.metadata.date || '1970-01-01').getTime();
        const dateB = new Date(b.metadata.date || '1970-01-01').getTime();
        return dateB - dateA; // 최신 순
      });
    } catch (error) {
      console.warn('Failed to load blog posts:', error);
      return [];
    }
  }

  /**
   * 포스트 메타데이터 추출 (YAML Front Matter)
   */
  private extractPostMetadata(content: string): PostMetadata {
    const frontMatterRegex = /^---\s*\r?\n([\s\S]*?)\r?\n---/;
    const match = content.match(frontMatterRegex);
    
    if (!match) {
      return {};
    }

    const yamlContent = match[1];
    const metadata: PostMetadata = {};

    try {
      // 간단한 YAML 파싱 (완전한 YAML 파서가 아님)
      const lines = yamlContent.split(/\r?\n/);
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#')) continue;

        const colonIndex = trimmedLine.indexOf(':');
        if (colonIndex === -1) continue;

        const key = trimmedLine.substring(0, colonIndex).trim();
        const value = trimmedLine.substring(colonIndex + 1).trim();

        // 따옴표 제거 (더 robust하게)
        const cleanValue = value.replace(/^["'](.*)["']$/, '$1');

        switch (key.toLowerCase()) {
          case 'title':
            metadata.title = cleanValue;
            break;
          case 'description':
            metadata.description = cleanValue;
            break;
          case 'author':
            metadata.author = cleanValue;
            break;
          case 'date':
            // Date validation
            if (cleanValue && !isNaN(Date.parse(cleanValue))) {
              metadata.date = cleanValue;
            }
            break;
          case 'category':
            metadata.category = cleanValue;
            break;
          case 'draft':
            metadata.draft = ['true', '1', 'yes'].includes(cleanValue.toLowerCase());
            break;
          case 'tags':
            if (cleanValue.startsWith('[') && cleanValue.endsWith(']')) {
              // 배열 형태 파싱 (더 robust하게)
              try {
                const tagsStr = cleanValue.slice(1, -1);
                metadata.tags = tagsStr
                  .split(',')
                  .map(tag => tag.trim().replace(/^["'](.*)["']$/, '$1'))
                  .filter(tag => tag.length > 0);
              } catch {
                // 파싱 실패시 빈 배열
                metadata.tags = [];
              }
            }
            break;
        }
      }
    } catch (error) {
      console.warn('Failed to parse YAML front matter:', error);
    }

    return metadata;
  }

  /**
   * 포스트 요약 추출
   */
  private extractExcerpt(content: string, maxLength: number = 300): string {
    // Front matter 제거
    const contentWithoutFrontMatter = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '');
    
    // 개행문자로 분할하고 빈 줄 제거
    const lines = contentWithoutFrontMatter.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // 헤딩이 아닌 첫 번째 줄 찾기
    const firstContentLine = lines.find(line => !line.startsWith('#')) || '';
    
    // 마크다운 문법 제거
    const plainText = firstContentLine
      .replace(/#+\s/g, '') // 헤딩
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
      .replace(/\*(.*?)\*/g, '$1') // Italic
      .replace(/`(.*?)`/g, '$1') // Code
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Links
      .trim();

    if (plainText.length <= maxLength) {
      return plainText;
    }

    return plainText.substring(0, maxLength).trim() + '...';
  }

  /**
   * 읽기 시간 계산 (분 단위)
   */
  private calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return Math.max(minutes, 1);
  }

  /**
   * 페이지 파일 목록 조회 (content/pages 폴더)
   */
  async getPages(): Promise<ContentFile[]> {
    try {
      const pagesDirectory = await this.getContentDirectoryListing('content/pages');
      const pages: ContentFile[] = [];

      for (const file of pagesDirectory.files) {
        if (file.name.endsWith('.md') || file.name.endsWith('.mdx')) {
          try {
            const contentFile = await this.getFileContent(file.path);
            pages.push(contentFile);
          } catch (error) {
            console.warn(`Failed to load page ${file.path}:`, error);
            pages.push(file);
          }
        }
      }

      return pages.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.warn('Failed to load pages:', error);
      return [];
    }
  }

  /**
   * 카테고리 설정 파일 읽기
   */
  async getCategories(): Promise<unknown[]> {
    try {
      const categoriesFile = await this.getFileContent('content/categories.json');
      return JSON.parse(categoriesFile.content || '[]');
    } catch (error) {
      console.warn('Failed to load categories:', error);
      return [];
    }
  }

  /**
   * 블로그 설정 파일 읽기
   */
  async getBlogConfig(): Promise<Record<string, unknown>> {
    try {
      const configFile = await this.getFileContent('content/config.json');
      return JSON.parse(configFile.content || '{}');
    } catch (error) {
      console.warn('Failed to load blog config:', error);
      return {};
    }
  }

  /**
   * 파일 생성
   */
  async createFile(
    filePath: string, 
    content: string, 
    options: FileOperationOptions = {}
  ): Promise<GitHubCommitInfo> {
    const { owner, repo } = this.getOwnerAndRepo();
    
    const commitMessage = options.message || `Create ${filePath}`;
    return await this.apiService.createOrUpdateFile(
      owner, 
      repo, 
      filePath, 
      content, 
      { ...options, message: commitMessage }
    );
  }

  /**
   * 파일 수정
   */
  async updateFile(
    filePath: string, 
    content: string, 
    sha: string,
    options: FileOperationOptions = {}
  ): Promise<GitHubCommitInfo> {
    const { owner, repo } = this.getOwnerAndRepo();
    
    const commitMessage = options.message || `Update ${filePath}`;
    return await this.apiService.createOrUpdateFile(
      owner, 
      repo, 
      filePath, 
      content, 
      { ...options, message: commitMessage, sha }
    );
  }

  /**
   * 파일 삭제
   */
  async deleteFile(
    filePath: string, 
    sha: string,
    options: FileOperationOptions = {}
  ): Promise<GitHubCommitInfo> {
    const { owner, repo } = this.getOwnerAndRepo();
    
    const commitMessage = options.message || `Delete ${filePath}`;
    return await this.apiService.deleteFile(
      owner, 
      repo, 
      filePath, 
      sha, 
      { ...options, message: commitMessage }
    );
  }

  /**
   * 새 블로그 포스트 생성
   */
  async createBlogPost(
    title: string,
    content: string,
    metadata: Partial<PostMetadata> = {}
  ): Promise<GitHubCommitInfo> {
    const slug = this.generateSlug(title);
    const fileName = `${new Date().toISOString().split('T')[0]}-${slug}.md`;
    const filePath = `content/posts/${fileName}`;
    
    const frontMatter = this.generateFrontMatter({
      title,
      date: new Date().toISOString().split('T')[0],
      draft: false,
      ...metadata,
    });
    
    const fullContent = `${frontMatter}\n\n${content}`;
    
    return await this.createFile(filePath, fullContent, {
      message: `Add new blog post: ${title}`,
    });
  }

  /**
   * 슬러그 생성
   */
  private generateSlug(title: string): string {
    if (!title || typeof title !== 'string') {
      return 'untitled';
    }

    return title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, '') // 특수문자 제거
      .replace(/\s+/g, '-') // 공백을 대시로
      .replace(/-+/g, '-') // 연속 대시를 단일 대시로
      .replace(/^-+|-+$/g, '') // 앞뒤 대시 제거
      .trim() || 'untitled'; // 빈 문자열일 경우 기본값
  }

  /**
   * Front Matter 생성
   */
  private generateFrontMatter(metadata: PostMetadata): string {
    const lines = ['---'];
    
    if (metadata.title) lines.push(`title: "${metadata.title}"`);
    if (metadata.description) lines.push(`description: "${metadata.description}"`);
    if (metadata.author) lines.push(`author: "${metadata.author}"`);
    if (metadata.date) lines.push(`date: "${metadata.date}"`);
    if (metadata.category) lines.push(`category: "${metadata.category}"`);
    if (metadata.tags && metadata.tags.length > 0) {
      lines.push(`tags: [${metadata.tags.map(tag => `"${tag}"`).join(', ')}]`);
    }
    if (metadata.draft !== undefined) lines.push(`draft: ${metadata.draft}`);
    
    lines.push('---');
    
    return lines.join('\n');
  }
}