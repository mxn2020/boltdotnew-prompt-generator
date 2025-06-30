export interface Prompt {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  content: PromptContent;
  structure_type: StructureType;
  category: string;
  type: string;
  language: string;
  complexity: Complexity;
  is_public: boolean;
  is_featured: boolean;
  version_major: number;
  version_minor: number;
  version_batch: number;
  tags: string[];
  view_count: number;
  like_count: number;
  fork_count: number;
  forked_from?: string;
  created_at: string;
  updated_at: string;
}

export type StructureType = 'standard' | 'structured' | 'modulized' | 'advanced';
export type Complexity = 'simple' | 'medium' | 'complex';

export interface PromptContent {
  segments?: PromptSegment[];
  sections?: PromptSection[];
  modules?: PromptModule[];
  blocks?: PromptBlock[];
  metadata?: Record<string, any>;
}

export interface PromptSegment {
  id: string;
  type: 'system' | 'user' | 'assistant' | 'context' | 'instruction';
  content: string;
  order: number;
}

export interface PromptSection {
  id: string;
  title: string;
  description?: string;
  content: string;
  order: number;
  parent_id?: string;
  children?: PromptSection[];
}

export interface PromptModule {
  id: string;
  title: string;
  description?: string;
  content: string;
  wrapper_id?: string;
  config?: Record<string, any>;
  order: number;
}

export interface PromptBlock {
  id: string;
  title: string;
  description?: string;
  modules: PromptModule[];
  assets?: PromptAsset[];
  order: number;
}

export interface PromptAsset {
  id: string;
  type: 'prompt' | 'file' | 'url';
  reference: string;
  title?: string;
  description?: string;
}

export interface PromptFile {
  id: string;
  prompt_id: string;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

export interface CreatePromptData {
  title: string;
  description?: string;
  content: PromptContent;
  structure_type: StructureType;
  category: string;
  type: string;
  language: string;
  complexity: Complexity;
  is_public?: boolean;
  tags?: string[];
}

export interface UpdatePromptData extends Partial<CreatePromptData> {
  id: string;
}

export interface PromptFilters {
  search?: string;
  category?: string;
  structure_type?: StructureType;
  complexity?: Complexity;
  is_public?: boolean;
  tags?: string[];
  user_id?: string;
}

export interface PromptSortOptions {
  field: 'created_at' | 'updated_at' | 'title' | 'view_count' | 'like_count';
  direction: 'asc' | 'desc';
}