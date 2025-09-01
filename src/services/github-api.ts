import { Octokit } from '@octokit/rest';
import type {
  GitHubUser,
  GitHubRepository,
  GitHubFileContent,
  GitHubDirectoryItem,
  GitHubFileMetadata,
  GitHubRateLimit,
  GitHubApiError,
  GitHubCommitInfo,
  FileOperationOptions,
  PermissionCheckResult,
} from '@/types/github';

export class GitHubApiService {
  private octokit: Octokit | null = null;
  private token: string | null = null;
  private rateLimitCache: GitHubRateLimit | null = null;
  private rateLimitCacheExpiry: number = 0;

  /**
   * 인증된 Octokit 인스턴스 초기화
   */
  initialize(token: string): void {
    this.token = token;
    this.octokit = new Octokit({
      auth: token,
      request: {
        timeout: 10000, // 10초 타임아웃
      },
    });
  }

  /**
   * Octokit 인스턴스 해제
   */
  destroy(): void {
    this.octokit = null;
    this.token = null;
  }

  /**
   * 인증된 상태 확인
   */
  private ensureAuthenticated(): void {
    if (!this.octokit || !this.token) {
      throw new Error('GitHub API client is not authenticated');
    }
  }

  /**
   * 현재 사용자 정보 가져오기
   */
  async getCurrentUser(): Promise<GitHubUser> {
    this.ensureAuthenticated();

    try {
      const response = await this.octokit!.rest.users.getAuthenticated();

      return {
        id: response.data.id,
        login: response.data.login,
        name: response.data.name,
        email: response.data.email,
        avatar_url: response.data.avatar_url,
        html_url: response.data.html_url,
        bio: response.data.bio,
        public_repos: response.data.public_repos,
        followers: response.data.followers,
        following: response.data.following,
      };
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      throw new Error('Failed to fetch user information');
    }
  }

  /**
   * 사용자 저장소 목록 가져오기 (write 권한 있는 것만)
   */
  async getUserRepositories(): Promise<GitHubRepository[]> {
    this.ensureAuthenticated();

    try {
      const response = await this.octokit!.rest.repos.listForAuthenticatedUser({
        type: 'all',
        sort: 'updated',
        per_page: 100,
      });

      // write 권한이 있는 저장소만 필터링
      return response.data
        .filter((repo) => repo.permissions?.push || repo.permissions?.admin)
        .map((repo) => ({
          id: repo.id,
          name: repo.name,
          full_name: repo.full_name,
          description: repo.description,
          private: repo.private,
          html_url: repo.html_url,
          clone_url: repo.clone_url,
          ssh_url: repo.ssh_url,
          default_branch: repo.default_branch,
          permissions: {
            admin: repo.permissions?.admin || false,
            maintain: repo.permissions?.maintain || false,
            push: repo.permissions?.push || false,
            triage: repo.permissions?.triage || false,
            pull: repo.permissions?.pull || false,
          },
          updated_at: repo.updated_at,
          created_at: repo.created_at,
        }));
    } catch (error) {
      console.error('Failed to fetch repositories:', error);
      throw new Error('Failed to fetch repositories');
    }
  }

  /**
   * Rate Limit 정보 확인
   */
  async getRateLimit(): Promise<GitHubRateLimit | null> {
    this.ensureAuthenticated();

    try {
      const response = await this.octokit!.rest.rateLimit.get();
      return {
        limit: response.data.rate.limit,
        used: response.data.rate.used,
        remaining: response.data.rate.remaining,
        reset: response.data.rate.reset,
      };
    } catch (error) {
      console.error('Failed to get rate limit:', error);
      return null;
    }
  }

  /**
   * 저장소 파일/디렉토리 목록 조회
   */
  async getDirectoryContents(
    owner: string,
    repo: string,
    path: string = '',
    ref?: string
  ): Promise<GitHubDirectoryItem[]> {
    this.ensureAuthenticated();

    return this.retryWithBackoff(async () => {
      try {
        const response = await this.octokit!.rest.repos.getContent({
          owner,
          repo,
          path,
          ref: ref || undefined,
        });

        if (Array.isArray(response.data)) {
          return response.data.map((item) => ({
            name: item.name,
            path: item.path,
            sha: item.sha,
            size: item.size,
            url: item.url,
            html_url: item.html_url,
            download_url: item.download_url,
            type: item.type as 'file' | 'dir',
            _links: item._links,
          }));
        }

        return [];
      } catch (error) {
        const apiError = this.handleApiError(error) as GitHubApiError;
        throw apiError;
      }
    });
  }

  /**
   * 특정 파일 내용 조회
   */
  async getFileContent(
    owner: string,
    repo: string,
    path: string,
    ref?: string
  ): Promise<GitHubFileContent> {
    this.ensureAuthenticated();

    return this.retryWithBackoff(async () => {
      try {
        const response = await this.octokit!.rest.repos.getContent({
          owner,
          repo,
          path,
          ref: ref || undefined,
        });

        if (!Array.isArray(response.data) && response.data.type === 'file') {
          const fileData = response.data as typeof response.data & {
            content: string;
            encoding: string;
          };
          return {
            name: fileData.name,
            path: fileData.path,
            sha: fileData.sha,
            size: fileData.size,
            url: fileData.url,
            html_url: fileData.html_url,
            download_url: fileData.download_url,
            type: 'file',
            content: fileData.content,
            encoding: fileData.encoding,
          };
        }

        throw new Error('Path is not a file');
      } catch (error) {
        const apiError = this.handleApiError(error) as GitHubApiError;
        throw apiError;
      }
    });
  }

  /**
   * 파일 생성 또는 업데이트
   */
  async createOrUpdateFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    options: FileOperationOptions = {}
  ): Promise<GitHubCommitInfo> {
    this.ensureAuthenticated();

    const { message, branch, sha } = options;

    return this.retryWithBackoff(async () => {
      try {
        // Properly encode UTF-8 content to Base64
        const encodedContent = btoa(
          encodeURIComponent(content).replace(/%([0-9A-F]{2})/g, (_, p1) =>
            String.fromCharCode(parseInt(p1, 16))
          )
        );

        const response =
          await this.octokit!.rest.repos.createOrUpdateFileContents({
            owner,
            repo,
            path,
            message: message || `Update ${path}`,
            content: encodedContent,
            branch: branch || undefined,
            sha: sha || undefined,
          });

        return {
          sha: response.data.commit.sha,
          message: response.data.commit.message || '',
          author: {
            name: response.data.commit.author?.name || '',
            email: response.data.commit.author?.email || '',
            date: response.data.commit.author?.date || '',
          },
          committer: {
            name: response.data.commit.committer?.name || '',
            email: response.data.commit.committer?.email || '',
            date: response.data.commit.committer?.date || '',
          },
        };
      } catch (error) {
        const apiError = this.handleApiError(error) as GitHubApiError;
        throw apiError;
      }
    });
  }

  /**
   * 파일 삭제
   */
  async deleteFile(
    owner: string,
    repo: string,
    path: string,
    sha: string,
    options: FileOperationOptions = {}
  ): Promise<GitHubCommitInfo> {
    this.ensureAuthenticated();

    const { message, branch } = options;

    return this.retryWithBackoff(async () => {
      try {
        const response = await this.octokit!.rest.repos.deleteFile({
          owner,
          repo,
          path,
          message: message || `Delete ${path}`,
          sha,
          branch: branch || undefined,
        });

        return {
          sha: response.data.commit.sha,
          message: response.data.commit.message || '',
          author: {
            name: response.data.commit.author?.name || '',
            email: response.data.commit.author?.email || '',
            date: response.data.commit.author?.date || '',
          },
          committer: {
            name: response.data.commit.committer?.name || '',
            email: response.data.commit.committer?.email || '',
            date: response.data.commit.committer?.date || '',
          },
        };
      } catch (error) {
        const apiError = this.handleApiError(error) as GitHubApiError;
        throw apiError;
      }
    });
  }

  /**
   * 재귀적으로 디렉토리 탐색
   */
  async getDirectoryContentsRecursive(
    owner: string,
    repo: string,
    path: string = '',
    ref?: string,
    maxDepth: number = 10
  ): Promise<GitHubFileMetadata[]> {
    if (maxDepth <= 0) {
      return [];
    }

    const items = await this.getDirectoryContents(owner, repo, path, ref);
    const results: GitHubFileMetadata[] = [];

    for (const item of items) {
      const metadata: GitHubFileMetadata = {
        name: item.name,
        path: item.path,
        sha: item.sha,
        size: item.size,
        type: item.type,
        downloadUrl: item.download_url || undefined,
      };

      results.push(metadata);

      if (item.type === 'dir') {
        const subItems = await this.getDirectoryContentsRecursive(
          owner,
          repo,
          item.path,
          ref,
          maxDepth - 1
        );
        results.push(...subItems);
      }
    }

    return results;
  }

  /**
   * Base64 디코딩된 파일 내용 가져오기
   */
  async getDecodedFileContent(
    owner: string,
    repo: string,
    path: string,
    ref?: string
  ): Promise<string> {
    const fileContent = await this.getFileContent(owner, repo, path, ref);

    if (!fileContent.content || fileContent.encoding !== 'base64') {
      throw new Error('File content is not base64 encoded or missing');
    }

    try {
      // Properly decode Base64 to UTF-8 content
      const decodedBytes = atob(fileContent.content.replace(/\n/g, ''));
      return decodeURIComponent(
        Array.from(
          decodedBytes,
          (byte) => '%' + ('00' + byte.charCodeAt(0).toString(16)).slice(-2)
        ).join('')
      );
    } catch (error) {
      throw new Error(
        `Failed to decode file content: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * API 호출 에러 처리
   */
  handleApiError(error: unknown): Error {
    if (error instanceof Error) {
      // GitHub API 특정 에러 처리
      if ('status' in error) {
        const errorWithStatus = error as Error & { status?: number };
        const status = errorWithStatus.status;

        switch (status) {
          case 401:
            return new Error(
              'GitHub authentication expired. Please login again.'
            );
          case 403:
            return new Error(
              'GitHub API rate limit exceeded. Please try again later.'
            );
          case 404:
            return new Error('GitHub resource not found.');
          case 422:
            return new Error('Invalid GitHub API request.');
          default:
            return new Error(`GitHub API error: ${errorWithStatus.message}`);
        }
      }

      return error;
    }

    return new Error('Unknown GitHub API error');
  }

  /**
   * 토큰 유효성 검사를 위한 간단한 API 호출
   */
  async validateConnection(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Rate Limit 체크 및 대기
   */
  private async checkRateLimit(): Promise<void> {
    const now = Date.now();

    // 캐시된 Rate Limit 정보가 유효한 경우 사용
    if (this.rateLimitCache && now < this.rateLimitCacheExpiry) {
      if (this.rateLimitCache.remaining <= 10) {
        const waitTime = this.rateLimitCache.reset * 1000 - now;
        if (waitTime > 0) {
          console.warn(
            `Rate limit approaching. Waiting ${Math.ceil(waitTime / 1000)}s...`
          );
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }
      return;
    }

    // Rate Limit 정보 새로 조회
    try {
      const rateLimit = await this.getRateLimit();
      if (rateLimit) {
        this.rateLimitCache = rateLimit;
        this.rateLimitCacheExpiry = now + 60 * 1000; // 1분간 캐시

        if (rateLimit.remaining <= 10) {
          const waitTime = rateLimit.reset * 1000 - now;
          if (waitTime > 0) {
            console.warn(
              `Rate limit approaching. Waiting ${Math.ceil(waitTime / 1000)}s...`
            );
            await new Promise((resolve) => setTimeout(resolve, waitTime));
          }
        }
      }
    } catch (error) {
      console.warn('Failed to check rate limit:', error);
    }
  }

  /**
   * API 호출 재시도 로직
   */
  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.checkRateLimit();
        return await operation();
      } catch (error) {
        lastError = error as Error;
        const apiError = error as GitHubApiError;

        // 재시도하지 않을 에러들
        if (apiError.status && [401, 404, 422].includes(apiError.status)) {
          throw error;
        }

        // Rate Limit 에러인 경우 대기 후 재시도
        if (apiError.status === 403) {
          const resetTime = this.rateLimitCache?.reset || 0;
          const waitTime = Math.max(resetTime * 1000 - Date.now(), 60000); // 최소 1분 대기

          if (attempt < maxRetries) {
            console.warn(
              `Rate limit exceeded. Waiting ${Math.ceil(waitTime / 1000)}s before retry ${attempt}/${maxRetries}...`
            );
            await new Promise((resolve) => setTimeout(resolve, waitTime));
            continue;
          }
        }

        // 기타 네트워크 에러의 경우 지수 백오프로 재시도
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1);
          console.warn(
            `API call failed (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms...`,
            error
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        throw error;
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  /**
   * 향상된 Rate Limit 정보 확인 (캐싱 포함)
   */
  async getRateLimitInfo(): Promise<GitHubRateLimit | null> {
    const now = Date.now();

    // 캐시된 정보가 유효한 경우 반환
    if (this.rateLimitCache && now < this.rateLimitCacheExpiry) {
      return this.rateLimitCache;
    }

    // 새로운 Rate Limit 정보 조회
    const rateLimit = await this.getRateLimit();
    if (rateLimit) {
      this.rateLimitCache = rateLimit;
      this.rateLimitCacheExpiry = now + 60 * 1000; // 1분간 캐시
    }

    return rateLimit;
  }

  /**
   * Repository에 대한 권한 확인
   */
  async checkRepositoryPermission(
    owner: string,
    repo: string,
    username?: string
  ): Promise<PermissionCheckResult> {
    this.ensureAuthenticated();

    return this.retryWithBackoff(async () => {
      try {
        // username이 제공되지 않은 경우 현재 사용자 정보 사용
        const targetUsername = username || (await this.getCurrentUser()).login;

        const response =
          await this.octokit!.rest.repos.getCollaboratorPermissionLevel({
            owner,
            repo,
            username: targetUsername,
          });

        const permission = response.data.permission as
          | 'admin'
          | 'write'
          | 'read'
          | 'none';
        const hasWriteAccess = permission === 'admin' || permission === 'write';

        return {
          hasWriteAccess,
          permission,
          checkedAt: new Date(),
        };
      } catch (error) {
        const apiError = this.handleApiError(error) as GitHubApiError;

        // 권한 확인 실패 시 기본적으로 읽기 전용으로 설정
        if (apiError.status === 404 || apiError.status === 403) {
          console.warn(
            `Permission check failed for ${owner}/${repo}:`,
            apiError.message
          );
          return {
            hasWriteAccess: false,
            permission: 'none',
            checkedAt: new Date(),
          };
        }

        throw apiError;
      }
    });
  }
}
