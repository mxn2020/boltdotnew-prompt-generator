export interface Prompt {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  content: PromptContent;
  prompt_type: PromptType;
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
  asset_fields?: Record<string, any>;
  asset_metadata?: Record<string, any>;
  view_count: number;
  like_count: number;
  fork_count: number;
  forked_from?: string;
  created_at: string;
  updated_at: string;
}

export type PromptType = 'prompt' | 'context' | 'response_schema' | 'response_examples' | 'persona' | 'instructions' | 'constraints' | 'examples';
export type StructureType = 'standard' | 'structured' | 'modulized' | 'advanced';
export type Complexity = 'simple' | 'medium' | 'complex' | 'custom';

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
  wrappers?: string[];
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
  prompt_type?: PromptType;
  structure_type: StructureType;
  category: string;
  type: string;
  language: string;
  complexity: Complexity;
  is_public?: boolean;
  tags?: string[];
  asset_fields?: Record<string, any>;
  asset_metadata?: Record<string, any>;
}

export interface UpdatePromptData extends Partial<CreatePromptData> {
  id: string;
}

export interface AssetFieldDefinition {
  field_name: string;
  field_type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'multiselect' | 'date' | 'url' | 'email';
  field_label: string;
  field_description?: string;
  field_options?: string[];
  is_required: boolean;
  display_order: number;
}

export interface CreateAssetData {
  title: string;
  description?: string;
  asset_type: PromptType;
  content: PromptContent;
  asset_fields?: Record<string, any>;
  category?: string;
  language?: string;
  complexity?: Complexity;
  tags?: string[];
  is_public?: boolean;
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