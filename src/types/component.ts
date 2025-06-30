export interface Component {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  type: ComponentType;
  content: ComponentContent;
  category: string;
  tags: string[];
  is_public: boolean;
  usage_count: number;
  rating: number;
  version_major: number;
  version_minor: number;
  version_batch: number;
  created_at: string;
  updated_at: string;
}

export type ComponentType = 'module' | 'wrapper' | 'template' | 'asset';

export interface ComponentContent {
  // Module content
  moduleContent?: string;
  moduleConfig?: Record<string, any>;
  
  // Wrapper content
  wrapperLogic?: string;
  wrapperType?: WrapperType;
  wrapperConfig?: Record<string, any>;
  
  // Template content
  templateStructure?: any;
  templateVariables?: TemplateVariable[];
  
  // Asset content
  assetType?: AssetType;
  assetReference?: string;
  assetMetadata?: Record<string, any>;
}

export type WrapperType = 
  | 'format-json' 
  | 'format-list' 
  | 'format-table'
  | 'validate-input' 
  | 'transform-data'
  | 'conditional-logic'
  | 'custom';

export type AssetType = 'prompt' | 'file' | 'url' | 'image' | 'document';

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description?: string;
  defaultValue?: any;
  required?: boolean;
}

export interface ComponentUsage {
  id: string;
  component_id: string;
  prompt_id: string;
  used_at: string;
}

export interface ComponentRating {
  id: string;
  component_id: string;
  user_id: string;
  rating: number;
  review?: string;
  created_at: string;
}

export interface CreateComponentData {
  title: string;
  description?: string;
  type: ComponentType;
  content: ComponentContent;
  category: string;
  tags?: string[];
  is_public?: boolean;
}

export interface UpdateComponentData extends Partial<CreateComponentData> {
  id: string;
}

export interface ComponentFilters {
  search?: string;
  type?: ComponentType;
  category?: string;
  tags?: string[];
  is_public?: boolean;
  user_id?: string;
  rating_min?: number;
}

export interface ComponentSortOptions {
  field: 'created_at' | 'updated_at' | 'title' | 'usage_count' | 'rating';
  direction: 'asc' | 'desc';
}