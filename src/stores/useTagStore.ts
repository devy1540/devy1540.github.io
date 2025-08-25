import type { Tag } from '@/types';
import { generateSlug } from '@/utils/frontmatter';
import { createTaxonomyStore } from './createTaxonomyStore';

// Simply create the store using the factory.
// The generic state from createTaxonomyStore is sufficient.

const createTag = (name: string): Tag => ({
  id: generateSlug(name),
  name: name.trim(),
  slug: generateSlug(name),
  postCount: 0,
});

export const useTagStore = createTaxonomyStore<Tag>(createTag);