import type { PostData, PublishConfig } from '@/types/publish';
import { GitHubContentService } from './github-content';
import { usePublishStore } from '@/stores/usePublishStore';
import { generateSlug } from '@/utils/frontmatter';

export class PublishService {
  constructor(private contentService: GitHubContentService) {}
  
  /**
   * Generate filename from post data
   */
  generateFilename(postData: PostData): string {
    const { metadata, slug } = postData;
    const date = metadata.date || new Date().toISOString().split('T')[0];
    return `${date}-${slug}.md`;
  }
  
  /**
   * Generate commit message
   */
  generateCommitMessage(postData: PostData): string {
    const { title, content, metadata } = postData;
    const wordCount = content.split(/\s+/).length;
    const tags = metadata.tags?.join(', ') || 'none';
    
    return `feat: add new blog post "${title}"

- Created: ${this.generateFilename(postData)}
- Category: ${metadata.category || 'uncategorized'}  
- Tags: ${tags}
- Word count: ~${wordCount}

Published via Blog CMS`;
  }
  
  /**
   * Generate full markdown content with frontmatter
   */
  generateMarkdownContent(postData: PostData): string {
    const { content, metadata } = postData;
    
    // Generate frontmatter
    const frontmatterLines = ['---'];
    
    if (metadata.title) frontmatterLines.push(`title: "${metadata.title}"`);
    if (metadata.description) frontmatterLines.push(`description: "${metadata.description}"`);
    if (metadata.author) frontmatterLines.push(`author: "${metadata.author}"`);
    if (metadata.date) frontmatterLines.push(`date: "${metadata.date}"`);
    if (metadata.category) frontmatterLines.push(`category: "${metadata.category}"`);
    if (metadata.tags && metadata.tags.length > 0) {
      frontmatterLines.push(`tags: [${metadata.tags.map(tag => `"${tag}"`).join(', ')}]`);
    }
    if (metadata.draft !== undefined) frontmatterLines.push(`draft: ${metadata.draft}`);
    
    frontmatterLines.push('---');
    frontmatterLines.push(''); // Empty line after frontmatter
    
    return frontmatterLines.join('\n') + content;
  }
  
  /**
   * Validate post data before publishing
   */
  validatePostData(postData: PostData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!postData.title?.trim()) {
      errors.push('제목이 필요합니다');
    }
    
    if (!postData.content?.trim()) {
      errors.push('내용이 필요합니다');
    }
    
    if (!postData.slug?.trim()) {
      errors.push('슬러그가 필요합니다');
    }
    
    // Validate slug format
    if (postData.slug && !/^[a-z0-9가-힣-]+$/.test(postData.slug)) {
      errors.push('슬러그는 영문, 숫자, 한글, 하이픈만 사용 가능합니다');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Publish post to GitHub
   */
  async publishPost(postData: PostData, config: PublishConfig): Promise<void> {
    const { setPublishing, updatePublishStage } = usePublishStore.getState();
    
    try {
      setPublishing(true);
      
      // Stage 1: Validation
      updatePublishStage('validating', '포스트 데이터 검증 중...', 10);
      const validation = this.validatePostData(postData);
      
      if (!validation.valid) {
        throw new Error(`검증 실패: ${validation.errors.join(', ')}`);
      }
      
      // Stage 2: Preparing
      updatePublishStage('preparing', '파일 준비 중...', 25);
      const filename = this.generateFilename(postData);
      const filePath = config.path || `content/posts/${filename}`;
      const fullContent = this.generateMarkdownContent(postData);
      const commitMessage = config.message || this.generateCommitMessage(postData);
      
      // Stage 3: Check if file exists
      updatePublishStage('preparing', '기존 파일 확인 중...', 40);
      let existingFile = null;
      try {
        existingFile = await this.contentService.getFileContent(filePath);
      } catch {
        // File doesn't exist, which is fine for new posts
        console.log('File does not exist, creating new file');
      }
      
      // Stage 4: Committing
      updatePublishStage('committing', 'GitHub에 커밋 중...', 60);
      
      let commitInfo;
      if (existingFile) {
        // Update existing file
        commitInfo = await this.contentService.updateFile(
          filePath,
          fullContent,
          existingFile.sha,
          { message: commitMessage, branch: config.branch }
        );
      } else {
        // Create new file
        commitInfo = await this.contentService.createFile(
          filePath,
          fullContent,
          { message: commitMessage, branch: config.branch }
        );
      }
      
      // Stage 5: Pushing (this is handled by the GitHub API)
      updatePublishStage('pushing', '변경사항 푸시 중...', 80);
      
      // Stage 6: Deployment tracking
      updatePublishStage('deploying', '배포 대기 중...', 90);
      
      // Store commit info for deployment tracking
      const commitUrl = `https://github.com/${this.contentService.getCurrentRepository()?.full_name}/commit/${commitInfo.sha}`;
      
      usePublishStore.getState().setPublishStatus({
        stage: 'deploying',
        progress: 95,
        message: '배포 상태 확인 중...',
        commitUrl
      });
      
      // Complete the publishing process
      // Deployment tracking will be handled by useDeploymentStatus hook
      setTimeout(() => {
        updatePublishStage('completed', '게시 완료!', 100);
        setPublishing(false);
      }, 3000);
      
    } catch (error) {
      console.error('Publish failed:', error);
      updatePublishStage(
        'failed',
        '게시 실패',
        0,
        error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
      );
      setPublishing(false);
      throw error;
    }
  }
  
  /**
   * Generate slug from title if not provided
   */
  static generateSlugFromTitle(title: string): string {
    return generateSlug(title);
  }
}