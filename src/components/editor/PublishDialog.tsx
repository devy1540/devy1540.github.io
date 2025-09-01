import { FC, useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useEditorStore } from '@/stores/useEditorStore';
import { useRepositoryStore } from '@/stores/useRepositoryStore';
import type { PublishConfig, PostData } from '@/types/publish';
import { generateSlug } from '@/utils/frontmatter';
import { GitCommit, Upload } from 'lucide-react';

interface PublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (postData: PostData, config: PublishConfig) => void;
  isPublishing?: boolean;
}

export const PublishDialog: FC<PublishDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  isPublishing = false
}) => {
  const { content, metadata } = useEditorStore();
  const { currentRepo } = useRepositoryStore();
  
  const [commitMessage, setCommitMessage] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [postSlug, setPostSlug] = useState('');
  const [branch, setBranch] = useState('main');
  
  // Initialize form data when dialog opens
  useEffect(() => {
    if (open) {
      const title = metadata.title || 'Untitled Post';
      const slug = metadata.slug || generateSlug(title);
      
      setPostTitle(title);
      setPostSlug(slug);
      
      // Generate default commit message
      const defaultMessage = `feat: add new blog post "${title}"

Published via Blog CMS`;
      setCommitMessage(defaultMessage);
      setBranch(currentRepo?.default_branch || 'main');
    }
  }, [open, metadata, currentRepo]);

  // Auto-generate slug when title changes
  const handleTitleChange = useCallback((value: string) => {
    setPostTitle(value);
    if (!postSlug || postSlug === generateSlug(postTitle)) {
      setPostSlug(generateSlug(value));
    }
  }, [postTitle, postSlug]);

  const handleSlugChange = useCallback((value: string) => {
    // Use the same slug generation logic as the utility function
    const formattedSlug = generateSlug(value);
    setPostSlug(formattedSlug);
  }, []);

  const handleConfirm = useCallback(() => {
    if (!postTitle.trim() || !postSlug.trim() || !commitMessage.trim()) {
      return;
    }

    const postData: PostData = {
      title: postTitle.trim(),
      content: content || '',
      slug: postSlug.trim(),
      metadata: {
        ...metadata,
        title: postTitle.trim(),
        slug: postSlug.trim(),
        date: metadata.date || new Date().toISOString().split('T')[0],
        draft: false,
      }
    };

    const config: PublishConfig = {
      message: commitMessage.trim(),
      branch: branch.trim() || 'main',
      path: `content/posts/${new Date().toISOString().split('T')[0]}-${postSlug.trim()}.md`
    };

    onConfirm(postData, config);
  }, [postTitle, postSlug, commitMessage, branch, content, metadata, onConfirm]);

  const canConfirm = postTitle.trim() && postSlug.trim() && commitMessage.trim() && !isPublishing;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            블로그 포스트 게시
          </DialogTitle>
          <DialogDescription>
            GitHub 저장소에 포스트를 커밋하고 자동 배포를 시작합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Post Title */}
          <div className="grid gap-2">
            <label htmlFor="title" className="text-sm font-medium">
              제목
            </label>
            <Input
              id="title"
              value={postTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="포스트 제목을 입력하세요"
              disabled={isPublishing}
            />
          </div>

          {/* Post Slug */}
          <div className="grid gap-2">
            <label htmlFor="slug" className="text-sm font-medium">
              슬러그 (URL)
            </label>
            <Input
              id="slug"
              value={postSlug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="post-url-slug"
              disabled={isPublishing}
            />
            <p className="text-xs text-muted-foreground">
              URL에 사용될 식별자입니다. 영문, 숫자, 하이픈만 사용 가능합니다.
            </p>
          </div>

          {/* Branch */}
          <div className="grid gap-2">
            <label htmlFor="branch" className="text-sm font-medium">
              브랜치
            </label>
            <Input
              id="branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="main"
              disabled={isPublishing}
            />
          </div>

          {/* Commit Message */}
          <div className="grid gap-2">
            <label htmlFor="message" className="text-sm font-medium">
              커밋 메시지
            </label>
            <Textarea
              id="message"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="커밋 메시지를 입력하세요"
              className="min-h-[100px]"
              disabled={isPublishing}
            />
          </div>

          {/* Repository Info */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>저장소:</strong> {currentRepo?.full_name || 'No repository selected'}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>파일 경로:</strong> content/posts/{new Date().toISOString().split('T')[0]}-{postSlug}.md
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isPublishing}
          >
            취소
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="gap-2"
          >
            {isPublishing ? (
              <>
                <GitCommit className="h-4 w-4 animate-spin" />
                게시 중...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                게시하기
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};