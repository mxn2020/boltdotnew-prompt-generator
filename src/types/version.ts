export interface PromptVersion {
  id: string;
  prompt_id: string;
  version_major: number;
  version_minor: number;
  version_batch: number;
  title: string;
  description?: string;
  content: any;
  structure_type: string;
  category: string;
  type: string;
  language: string;
  complexity: string;
  tags: string[];
  changelog?: string;
  created_at: string;
  created_by: string;
}

export interface VersionComparison {
  from: PromptVersion;
  to: PromptVersion;
  changes: VersionChange[];
}

export interface VersionChange {
  type: 'added' | 'removed' | 'modified';
  path: string;
  oldValue?: any;
  newValue?: any;
  description: string;
}

export interface CreateVersionData {
  prompt_id: string;
  version_type: 'major' | 'minor' | 'batch';
  changelog?: string;
}

export interface ExportFormat {
  id: string;
  name: string;
  description: string;
  extension: string;
  mimeType: string;
  supportsCustomization: boolean;
}

export interface ExportOptions {
  format: string;
  includeMetadata: boolean;
  includeVersionInfo: boolean;
  customTemplate?: string;
  formatting?: {
    indentation?: number;
    lineBreaks?: boolean;
    comments?: boolean;
  };
}

export interface ExportResult {
  content: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface ExportLog {
  id: string;
  prompt_id: string;
  user_id: string;
  format: string;
  options: ExportOptions;
  filename: string;
  file_size: number;
  created_at: string;
}