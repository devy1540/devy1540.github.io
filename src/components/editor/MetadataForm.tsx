import { useState, useCallback, useEffect, useRef } from 'react';
import { useEditorStore } from '@/stores/useEditorStore';
import { useTagStore } from '@/stores/useTagStore';
import { useCategoryStore } from '@/stores/useCategoryStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Image, Tag, Folder } from 'lucide-react';
import { generateSlug } from '@/utils/frontmatter';
import type { Post } from '@/types';

interface MetadataFormProps {
  className?: string;
}

export const MetadataForm: React.FC<MetadataFormProps> = ({ className }) => {
  const { metadata, updateMetadata } = useEditorStore();
  const { addItem: addTag, getSuggestions: getTagSuggestions } = useTagStore();
  const { addItem: addCategory, getSuggestions: getCategorySuggestions } = useCategoryStore();
  
  const [localMetadata, setLocalMetadata] = useState(metadata);
  const [newTag, setNewTag] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  
  const tagInputRef = useRef<HTMLInputElement>(null);
  const categoryInputRef = useRef<HTMLInputElement>(null);

  // Handle title change with auto-slug
  const handleTitleChange = useCallback((title: string) => {
    const slug = generateSlug(title);
    const updates = { title, slug };
    setLocalMetadata(prev => ({ ...prev, ...updates }));
    updateMetadata(updates);
  }, [updateMetadata]);

  // Handle metadata field updates
  const handleFieldChange = useCallback((field: keyof Post, value: unknown) => {
    const updates = { [field]: value };
    setLocalMetadata(prev => ({ ...prev, ...updates }));
    updateMetadata(updates);
  }, [updateMetadata]);

  // Handle SEO metadata updates
  const handleSEOChange = useCallback((field: keyof Post['metadata'], value: string) => {
    const seoMetadata = { ...localMetadata.metadata, [field]: value };
    const updates = { metadata: seoMetadata };
    setLocalMetadata(prev => ({ ...prev, ...updates }));
    updateMetadata(updates);
  }, [localMetadata.metadata, updateMetadata]);

  // Tag management with auto-complete
  const addTagToPost = useCallback((tagName: string) => {
    if (!tagName.trim() || localMetadata.tags?.includes(tagName.trim())) return;
    
    // Add to global tag store
    addTag(tagName.trim());
    
    const newTags = [...(localMetadata.tags || []), tagName.trim()];
    handleFieldChange('tags', newTags);
    setNewTag('');
    setShowTagSuggestions(false);
  }, [localMetadata.tags, handleFieldChange, addTag]);

  const removeTag = useCallback((tagToRemove: string) => {
    const newTags = localMetadata.tags?.filter(tag => tag !== tagToRemove) || [];
    handleFieldChange('tags', newTags);
  }, [localMetadata.tags, handleFieldChange]);

  // Handle tag input with suggestions
  const handleTagKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTagToPost(newTag);
    } else if (e.key === 'Backspace' && !newTag && localMetadata.tags?.length) {
      removeTag(localMetadata.tags[localMetadata.tags.length - 1]);
    } else if (e.key === 'Escape') {
      setShowTagSuggestions(false);
    }
  }, [newTag, addTagToPost, removeTag, localMetadata.tags]);

  const handleTagInputChange = useCallback((value: string) => {
    setNewTag(value);
    setShowTagSuggestions(value.length > 0);
  }, []);

  // Category management with auto-complete
  const handleCategoryChange = useCallback((categoryName: string) => {
    if (categoryName.trim()) {
      // Add to global category store if it doesn't exist
      addCategory(categoryName.trim());
    }
    handleFieldChange('category', categoryName.trim());
    setCategoryInput(categoryName);
    setShowCategorySuggestions(false);
  }, [handleFieldChange, addCategory]);

  const handleCategoryInputChange = useCallback((value: string) => {
    setCategoryInput(value);
    setShowCategorySuggestions(value.length > 0);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        document.activeElement?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync with store metadata
  useEffect(() => {
    setLocalMetadata(metadata);
  }, [metadata]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-4 w-4" />
            기본 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-red-500">
              제목 *
            </label>
            <Input
              id="title"
              value={localMetadata.title || ''}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="포스트 제목을 입력하세요"
              className="w-full"
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <label htmlFor="slug" className="text-sm font-medium">
              슬러그
            </label>
            <Input
              id="slug"
              value={localMetadata.slug || ''}
              onChange={(e) => handleFieldChange('slug', e.target.value)}
              placeholder="url-friendly-slug"
              className="w-full font-mono text-sm"
            />
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <label htmlFor="excerpt" className="text-sm font-medium">
              요약
            </label>
            <Input
              id="excerpt"
              value={localMetadata.excerpt || ''}
              onChange={(e) => handleFieldChange('excerpt', e.target.value)}
              placeholder="포스트 요약을 입력하세요"
              className="w-full"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              카테고리
            </label>
            <div className="relative">
              <Input
                ref={categoryInputRef}
                id="category"
                value={categoryInput || localMetadata.category || ''}
                onChange={(e) => {
                  handleCategoryInputChange(e.target.value);
                  handleFieldChange('category', e.target.value);
                }}
                onFocus={() => setShowCategorySuggestions(categoryInput.length > 0)}
                onBlur={() => setTimeout(() => setShowCategorySuggestions(false), 200)}
                placeholder="카테고리를 입력하세요"
                className="w-full"
              />
              {showCategorySuggestions && (
                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-40 overflow-y-auto">
                  {getCategorySuggestions(categoryInput).map((category) => (
                    <div
                      key={category.id}
                      className="px-3 py-2 hover:bg-muted cursor-pointer flex items-center justify-between"
                      onClick={() => handleCategoryChange(category.name)}
                    >
                      <span>{category.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {category.postCount}
                      </Badge>
                    </div>
                  ))}
                  {categoryInput.trim() && !getCategorySuggestions(categoryInput).find(c => c.name.toLowerCase() === categoryInput.toLowerCase()) && (
                    <div
                      className="px-3 py-2 hover:bg-muted cursor-pointer text-sm text-muted-foreground"
                      onClick={() => handleCategoryChange(categoryInput)}
                    >
                      "{categoryInput}" 새 카테고리 생성
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            태그
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tag Input */}
          <div className="space-y-2">
            <label htmlFor="tags" className="text-sm font-medium">
              태그 추가
            </label>
            <div className="relative">
              <Input
                ref={tagInputRef}
                id="tags"
                value={newTag}
                onChange={(e) => handleTagInputChange(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onFocus={() => setShowTagSuggestions(newTag.length > 0)}
                onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                placeholder="태그를 입력하고 Enter를 누르세요"
                className="w-full"
              />
              {showTagSuggestions && (
                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-40 overflow-y-auto">
                  {getTagSuggestions(newTag).map((tag) => (
                    <div
                      key={tag.id}
                      className="px-3 py-2 hover:bg-muted cursor-pointer flex items-center justify-between"
                      onClick={() => addTagToPost(tag.name)}
                    >
                      <span>{tag.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {tag.postCount}
                      </Badge>
                    </div>
                  ))}
                  {newTag.trim() && !getTagSuggestions(newTag).find(t => t.name.toLowerCase() === newTag.toLowerCase()) && (
                    <div
                      className="px-3 py-2 hover:bg-muted cursor-pointer text-sm text-muted-foreground"
                      onClick={() => addTagToPost(newTag)}
                    >
                      "{newTag}" 새 태그 생성
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tag List */}
          {localMetadata.tags?.length ? (
            <div className="flex flex-wrap gap-2">
              {localMetadata.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => removeTag(tag)}
                >
                  {tag} ×
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              태그가 없습니다. 위에서 태그를 추가해보세요.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Publishing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            발행 설정
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Thumbnail */}
          <div className="space-y-2">
            <label htmlFor="thumbnail" className="text-sm font-medium flex items-center gap-2">
              <Image className="h-4 w-4" />
              썸네일 URL
            </label>
            <Input
              id="thumbnail"
              value={localMetadata.thumbnail || ''}
              onChange={(e) => handleFieldChange('thumbnail', e.target.value || null)}
              placeholder="https://example.com/image.jpg"
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* SEO Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>SEO 메타데이터</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="ogTitle" className="text-sm font-medium">
              OG 제목
            </label>
            <Input
              id="ogTitle"
              value={localMetadata.metadata?.ogTitle || ''}
              onChange={(e) => handleSEOChange('ogTitle', e.target.value)}
              placeholder="소셜 미디어용 제목"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="ogDescription" className="text-sm font-medium">
              OG 설명
            </label>
            <Input
              id="ogDescription"
              value={localMetadata.metadata?.ogDescription || ''}
              onChange={(e) => handleSEOChange('ogDescription', e.target.value)}
              placeholder="소셜 미디어용 설명"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="ogImage" className="text-sm font-medium">
              OG 이미지
            </label>
            <Input
              id="ogImage"
              value={localMetadata.metadata?.ogImage || ''}
              onChange={(e) => handleSEOChange('ogImage', e.target.value)}
              placeholder="https://example.com/og-image.jpg"
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

    </div>
  );
};