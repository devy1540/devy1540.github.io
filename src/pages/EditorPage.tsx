import { FC, useState, useCallback, useMemo, useEffect } from 'react';
import { EnhancedMarkdownEditorContainer } from '@/components/editor/EnhancedMarkdownEditorContainer';
import { MetadataForm } from '@/components/editor/MetadataForm';
import { SaveStatus } from '@/components/editor/SaveStatus';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useEditorStore } from '@/stores/useEditorStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useDraftRecovery } from '@/hooks/useDraftRecovery';
import { Settings2, Save, FileText } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export const EditorPage: FC = () => {
  const isMobile = useIsMobile();
  const [isMetadataPanelOpen, setIsMetadataPanelOpen] = useState(false);
  const { metadata, isDirty } = useEditorStore();
  const { saveNow } = useAutoSave();
  
  // Initialize draft recovery
  useDraftRecovery();

  const handleSave = useCallback(async () => {
    try {
      await saveNow();
    } catch (error) {
      console.error('Manual save failed:', error);
    }
  }, [saveNow]);

  // Global Cmd+S keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault();
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  // VS Code style title and status
  const documentTitle = useMemo(() => {
    const title = metadata.title || 'Untitled';
    return isDirty ? `● ${title}` : title;
  }, [metadata.title, isDirty]);


  const renderMetadataPanel = () => (
    <div className="h-full overflow-y-auto">
      <MetadataForm />
    </div>
  );

  if (isMobile) {
    // Mobile layout: Bottom sheet
    return (
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between p-4">
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <h1 className="text-lg font-semibold truncate">{documentTitle}</h1>
              <SaveStatus />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Sheet open={isMetadataPanelOpen} onOpenChange={setIsMetadataPanelOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings2 className="h-4 w-4" />
                    메타데이터
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="max-h-[85vh]">
                  <div className="py-4">
                    <h2 className="text-lg font-semibold mb-4">포스트 메타데이터</h2>
                    {renderMetadataPanel()}
                  </div>
                </SheetContent>
              </Sheet>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => window.location.href = '/drafts'}
              >
                <FileText className="h-4 w-4" />
                초안
              </Button>
              <Button onClick={handleSave} size="sm" className="gap-2">
                <Save className="h-4 w-4" />
                저장
              </Button>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden p-4">
          <div className="h-full">
            <EnhancedMarkdownEditorContainer />
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout: Right sidebar
  return (
    <div className="flex h-screen">
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between p-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold">{documentTitle}</h1>
              <SaveStatus />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMetadataPanelOpen(!isMetadataPanelOpen)}
                className="gap-2 lg:hidden"
              >
                <Settings2 className="h-4 w-4" />
                {isMetadataPanelOpen ? '메타데이터 숨기기' : '메타데이터 보기'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => window.location.href = '/drafts'}
              >
                <FileText className="h-4 w-4" />
                초안
              </Button>
              <Button onClick={handleSave} size="sm" className="gap-2">
                <Save className="h-4 w-4" />
                저장
              </Button>
            </div>
          </div>
        </div>

        {/* Editor Container with proper spacing */}
        <div className="flex-1 overflow-hidden p-4 lg:p-6">
          <div className="h-full max-w-7xl mx-auto">
            <EnhancedMarkdownEditorContainer />
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80 border-l bg-muted/50">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              포스트 메타데이터
            </h2>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {renderMetadataPanel()}
          </div>
        </div>
      </div>

      {/* Tablet Sidebar (Collapsible) */}
      {isMetadataPanelOpen && (
        <div className="lg:hidden w-80 border-l bg-background">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                포스트 메타데이터
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMetadataPanelOpen(false)}
              >
                ×
              </Button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              {renderMetadataPanel()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
