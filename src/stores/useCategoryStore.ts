import type { Category } from '@/types';
import { generateSlug } from '@/utils/frontmatter';
import { createTaxonomyStore } from './createTaxonomyStore';

const createCategory = (name: string, extraData?: Partial<Category>): Category => ({
  id: generateSlug(name),
  name: name.trim(),
  slug: generateSlug(name),
  description: extraData?.description || '',
  postCount: 0,
});

export const useCategoryStore = createTaxonomyStore<Category>(createCategory);