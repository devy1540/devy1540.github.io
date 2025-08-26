import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Edit, Trash2, Clock } from 'lucide-react';
import { useDraftStore } from '@/stores/useDraftStore';
import { useEditorStore } from '@/stores/useEditorStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useToastStore } from '@/stores/useToastStore';
import { SaveConfirmDialog } from './SaveConfirmDialog';
import type { Draft } from '@/utils/draft';

interface DraftCardProps {
  draft: Draft;
}

export const DraftCard: FC<DraftCardProps> = ({ draft }) => {
  const navigate = useNavigate();
  const { deleteDraft } = useDraftStore();
  const { updateContent, updateMetadata, setCurrentDraftId, reset, isDirty } =
    useEditorStore();
  const { saveNow } = useAutoSave();
  const { error: showErrorToast, success: showSuccessToast } = useToastStore();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);

  const loadDraftIntoEditor = () => {
    reset();
    updateContent(draft.content);
    updateMetadata(draft.metadata);
    setCurrentDraftId(draft.id);
    navigate('/editor');
  };

  const handleEdit = () => {
    // Check if there are unsaved changes
    if (isDirty) {
      setIsSaveConfirmOpen(true);
    } else {
      loadDraftIntoEditor();
    }
  };

  const handleSaveAndContinue = async () => {
    try {
      await saveNow();
      setIsSaveConfirmOpen(false);
      showSuccessToast('저장 완료', '현재 작업이 저장되었습니다.');
      loadDraftIntoEditor();
    } catch (error) {
      console.error('Failed to save before switching:', error);
      showErrorToast(
        '저장 실패',
        '현재 작업을 저장할 수 없습니다. 다시 시도해주세요.'
      );
    }
  };

  const handleDiscardAndContinue = () => {
    setIsSaveConfirmOpen(false);
    loadDraftIntoEditor();
  };

  const handleCancelSwitch = () => {
    setIsSaveConfirmOpen(false);
  };

  const handleDelete = async () => {
    try {
      await deleteDraft(draft.id);
      setIsDeleteDialogOpen(false);
      showSuccessToast(
        '삭제 완료',
        `"${draft.title || 'Untitled'}" 초안이 삭제되었습니다.`
      );
    } catch (error) {
      console.error('Failed to delete draft:', error);
      showErrorToast(
        '삭제 실패',
        '초안을 삭제할 수 없습니다. 다시 시도해주세요.'
      );
    }
  };

  const getPreviewText = (content: string, maxLength: number = 150) => {
    // Remove markdown syntax for preview
    const plainText = content
      .replace(/^#+ /gm, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/`(.*?)`/g, '$1') // Remove inline code
      .replace(/```[\s\S]*?```/g, '[코드 블록]') // Replace code blocks
      .replace(/!\[.*?\]\(.*?\)/g, '[이미지]') // Replace images
      .replace(/\[.*?\]\(.*?\)/g, '[링크]') // Replace links
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();

    return plainText.length > maxLength
      ? `${plainText.substring(0, maxLength)}...`
      : plainText;
  };

  const formatRelativeTime = (date: Date) => {
    try {
      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: ko,
      });
    } catch {
      return '알 수 없음';
    }
  };

  return (
    <>
      <Card
        className="group hover:shadow-md transition-shadow cursor-pointer"
        role="article"
        aria-labelledby={`draft-title-${draft.id}`}
        aria-describedby={`draft-preview-${draft.id}`}
      >
        <CardHeader className="pb-3">
          <CardTitle
            id={`draft-title-${draft.id}`}
            className="text-base line-clamp-2 mb-1"
          >
            {draft.title || 'Untitled'}
          </CardTitle>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" aria-hidden="true" />
            <time dateTime={draft.updatedAt.toISOString()}>
              {formatRelativeTime(draft.updatedAt)}
            </time>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <p
            id={`draft-preview-${draft.id}`}
            className="text-sm text-muted-foreground mb-4 line-clamp-3 min-h-[3rem]"
          >
            {getPreviewText(draft.content)}
          </p>

          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {Math.ceil(draft.content.length / 500)} 분 읽기
            </div>

            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit();
                }}
                className="h-8 px-2"
                aria-label={`편집: ${draft.title || 'Untitled'}`}
              >
                <Edit className="h-3 w-3" aria-hidden="true" />
                <span className="sr-only">편집</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDeleteDialogOpen(true);
                }}
                className="h-8 px-2 text-destructive hover:text-destructive"
                aria-label={`삭제: ${draft.title || 'Untitled'}`}
              >
                <Trash2 className="h-3 w-3" aria-hidden="true" />
                <span className="sr-only">삭제</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <SaveConfirmDialog
        open={isSaveConfirmOpen}
        onOpenChange={setIsSaveConfirmOpen}
        onSave={handleSaveAndContinue}
        onDiscard={handleDiscardAndContinue}
        onCancel={handleCancelSwitch}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>초안을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 초안이 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
