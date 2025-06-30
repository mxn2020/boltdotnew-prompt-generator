import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { 
  Prompt, 
  PromptContent, 
  StructureType, 
  Complexity,
  PromptSegment,
  PromptSection,
  PromptModule,
  PromptBlock
} from '../types/prompt';

interface PromptEditorState {
  // Current prompt being edited
  currentPrompt: Partial<Prompt> | null;
  
  // Editor state
  isEditing: boolean;
  hasUnsavedChanges: boolean;
  
  // UI state
  activeTab: string;
  sidebarCollapsed: boolean;
  
  // Actions
  setCurrentPrompt: (prompt: Partial<Prompt> | null) => void;
  updatePromptField: (field: keyof Prompt, value: any) => void;
  updatePromptContent: (content: PromptContent) => void;
  
  // Content manipulation
  addSegment: (segment: Omit<PromptSegment, 'id' | 'order'>) => void;
  updateSegment: (id: string, updates: Partial<PromptSegment>) => void;
  removeSegment: (id: string) => void;
  reorderSegments: (fromIndex: number, toIndex: number) => void;
  
  addSection: (section: Omit<PromptSection, 'id' | 'order'>) => void;
  updateSection: (id: string, updates: Partial<PromptSection>) => void;
  removeSection: (id: string) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  
  addModule: (module: Omit<PromptModule, 'id' | 'order'>) => void;
  updateModule: (id: string, updates: Partial<PromptModule>) => void;
  removeModule: (id: string) => void;
  reorderModules: (fromIndex: number, toIndex: number) => void;
  
  addBlock: (block: Omit<PromptBlock, 'id' | 'order'>) => void;
  updateBlock: (id: string, updates: Partial<PromptBlock>) => void;
  removeBlock: (id: string) => void;
  reorderBlocks: (fromIndex: number, toIndex: number) => void;
  
  // Editor actions
  startEditing: () => void;
  stopEditing: () => void;
  markAsChanged: () => void;
  markAsSaved: () => void;
  
  // UI actions
  setActiveTab: (tab: string) => void;
  toggleSidebar: () => void;
  
  // Reset
  reset: () => void;
}

const generateId = () => crypto.randomUUID();

export const usePromptStore = create<PromptEditorState>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentPrompt: null,
      isEditing: false,
      hasUnsavedChanges: false,
      activeTab: 'editor',
      sidebarCollapsed: false,

      // Basic prompt actions
      setCurrentPrompt: (prompt) => {
        set({ 
          currentPrompt: prompt,
          hasUnsavedChanges: false,
          isEditing: !!prompt 
        });
      },

      updatePromptField: (field, value) => {
        const { currentPrompt } = get();
        if (!currentPrompt) return;

        // Auto-generate IDs for content items if they don't exist
        if (field === 'content' && value) {
          value = ensureContentIds(value);
        }
        set({
          currentPrompt: { ...currentPrompt, [field]: value },
          hasUnsavedChanges: true,
        });
      },

      updatePromptContent: (content) => {
        const { currentPrompt } = get();
        if (!currentPrompt) return;

        set({
          currentPrompt: { ...currentPrompt, content },
          hasUnsavedChanges: true,
        });
      },

      // Segment actions
      addSegment: (segmentData) => {
        const { currentPrompt } = get();
        if (!currentPrompt) {
          return;
        }

        const content = currentPrompt.content || {};
        const segments = content.segments || [];
        const newSegment: PromptSegment = {
          ...segmentData,
          id: generateId(),
          order: segments.length,
        };

        set({
          currentPrompt: {
            ...currentPrompt,
            content: {
              ...content,
              segments: [...segments, newSegment],
            },
          },
          hasUnsavedChanges: true,
        });
      },

      updateSegment: (id, updates) => {
        const { currentPrompt } = get();
        if (!currentPrompt?.content?.segments) return;

        const segments = currentPrompt.content.segments.map(segment =>
          segment.id === id ? { ...segment, ...updates } : segment
        );

        set({
          currentPrompt: {
            ...currentPrompt,
            content: {
              ...currentPrompt.content,
              segments,
            },
          },
          hasUnsavedChanges: true,
        });
      },

      removeSegment: (id) => {
        const { currentPrompt } = get();
        if (!currentPrompt?.content?.segments) return;

        const segments = currentPrompt.content.segments
          .filter(segment => segment.id !== id)
          .map((segment, index) => ({ ...segment, order: index }));

        set({
          currentPrompt: {
            ...currentPrompt,
            content: {
              ...currentPrompt.content,
              segments,
            },
          },
          hasUnsavedChanges: true,
        });
      },

      reorderSegments: (fromIndex, toIndex) => {
        const { currentPrompt } = get();
        if (!currentPrompt?.content?.segments) return;

        const segments = [...currentPrompt.content.segments];
        const [removed] = segments.splice(fromIndex, 1);
        segments.splice(toIndex, 0, removed);

        // Update order
        const reorderedSegments = segments.map((segment, index) => ({
          ...segment,
          order: index,
        }));

        set({
          currentPrompt: {
            ...currentPrompt,
            content: {
              ...currentPrompt.content,
              segments: reorderedSegments,
            },
          },
          hasUnsavedChanges: true,
        });
      },

      // Section actions (similar pattern)
      addSection: (sectionData) => {
        const { currentPrompt } = get();
        if (!currentPrompt) return;

        const content = currentPrompt.content || {};
        const sections = content.sections || [];
        const newSection: PromptSection = {
          ...sectionData,
          id: generateId(),
          order: sections.length,
        };

        set({
          currentPrompt: {
            ...currentPrompt,
            content: {
              ...content,
              sections: [...sections, newSection],
            },
          },
          hasUnsavedChanges: true,
        });
      },

      updateSection: (id, updates) => {
        const { currentPrompt } = get();
        if (!currentPrompt?.content?.sections) return;

        const sections = currentPrompt.content.sections.map(section =>
          section.id === id ? { ...section, ...updates } : section
        );

        set({
          currentPrompt: {
            ...currentPrompt,
            content: {
              ...currentPrompt.content,
              sections,
            },
          },
          hasUnsavedChanges: true,
        });
      },

      removeSection: (id) => {
        const { currentPrompt } = get();
        if (!currentPrompt?.content?.sections) return;

        const sections = currentPrompt.content.sections
          .filter(section => section.id !== id)
          .map((section, index) => ({ ...section, order: index }));

        set({
          currentPrompt: {
            ...currentPrompt,
            content: {
              ...currentPrompt.content,
              sections,
            },
          },
          hasUnsavedChanges: true,
        });
      },

      reorderSections: (fromIndex, toIndex) => {
        const { currentPrompt } = get();
        if (!currentPrompt?.content?.sections) return;

        const sections = [...currentPrompt.content.sections];
        const [removed] = sections.splice(fromIndex, 1);
        sections.splice(toIndex, 0, removed);

        const reorderedSections = sections.map((section, index) => ({
          ...section,
          order: index,
        }));

        set({
          currentPrompt: {
            ...currentPrompt,
            content: {
              ...currentPrompt.content,
              sections: reorderedSections,
            },
          },
          hasUnsavedChanges: true,
        });
      },

      // Module actions (similar pattern)
      addModule: (moduleData) => {
        const { currentPrompt } = get();
        if (!currentPrompt) return;

        const content = currentPrompt.content || {};
        const modules = content.modules || [];
        const newModule: PromptModule = {
          ...moduleData,
          id: generateId(),
          order: modules.length,
        };

        set({
          currentPrompt: {
            ...currentPrompt,
            content: {
              ...content,
              modules: [...modules, newModule],
            },
          },
          hasUnsavedChanges: true,
        });
      },

      updateModule: (id, updates) => {
        const { currentPrompt } = get();
        if (!currentPrompt?.content?.modules) return;

        const modules = currentPrompt.content.modules.map(module =>
          module.id === id ? { ...module, ...updates } : module
        );

        set({
          currentPrompt: {
            ...currentPrompt,
            content: {
              ...currentPrompt.content,
              modules,
            },
          },
          hasUnsavedChanges: true,
        });
      },

      removeModule: (id) => {
        const { currentPrompt } = get();
        if (!currentPrompt?.content?.modules) return;

        const modules = currentPrompt.content.modules
          .filter(module => module.id !== id)
          .map((module, index) => ({ ...module, order: index }));

        set({
          currentPrompt: {
            ...currentPrompt,
            content: {
              ...currentPrompt.content,
              modules,
            },
          },
          hasUnsavedChanges: true,
        });
      },

      reorderModules: (fromIndex, toIndex) => {
        const { currentPrompt } = get();
        if (!currentPrompt?.content?.modules) return;

        const modules = [...currentPrompt.content.modules];
        const [removed] = modules.splice(fromIndex, 1);
        modules.splice(toIndex, 0, removed);

        const reorderedModules = modules.map((module, index) => ({
          ...module,
          order: index,
        }));

        set({
          currentPrompt: {
            ...currentPrompt,
            content: {
              ...currentPrompt.content,
              modules: reorderedModules,
            },
          },
          hasUnsavedChanges: true,
        });
      },

      // Block actions (similar pattern)
      addBlock: (blockData) => {
        const { currentPrompt } = get();
        if (!currentPrompt) return;

        const content = currentPrompt.content || {};
        const blocks = content.blocks || [];
        const newBlock: PromptBlock = {
          ...blockData,
          id: generateId(),
          order: blocks.length,
          modules: blockData.modules || [],
        };

        set({
          currentPrompt: {
            ...currentPrompt,
            content: {
              ...content,
              blocks: [...blocks, newBlock],
            },
          },
          hasUnsavedChanges: true,
        });
      },

      updateBlock: (id, updates) => {
        const { currentPrompt } = get();
        if (!currentPrompt?.content?.blocks) return;

        const blocks = currentPrompt.content.blocks.map(block =>
          block.id === id ? { ...block, ...updates } : block
        );

        set({
          currentPrompt: {
            ...currentPrompt,
            content: {
              ...currentPrompt.content,
              blocks,
            },
          },
          hasUnsavedChanges: true,
        });
      },

      removeBlock: (id) => {
        const { currentPrompt } = get();
        if (!currentPrompt?.content?.blocks) return;

        const blocks = currentPrompt.content.blocks
          .filter(block => block.id !== id)
          .map((block, index) => ({ ...block, order: index }));

        set({
          currentPrompt: {
            ...currentPrompt,
            content: {
              ...currentPrompt.content,
              blocks,
            },
          },
          hasUnsavedChanges: true,
        });
      },

      reorderBlocks: (fromIndex, toIndex) => {
        const { currentPrompt } = get();
        if (!currentPrompt?.content?.blocks) return;

        const blocks = [...currentPrompt.content.blocks];
        const [removed] = blocks.splice(fromIndex, 1);
        blocks.splice(toIndex, 0, removed);

        const reorderedBlocks = blocks.map((block, index) => ({
          ...block,
          order: index,
        }));

        set({
          currentPrompt: {
            ...currentPrompt,
            content: {
              ...currentPrompt.content,
              blocks: reorderedBlocks,
            },
          },
          hasUnsavedChanges: true,
        });
      },

      // Editor state actions
      startEditing: () => set({ isEditing: true }),
      stopEditing: () => set({ isEditing: false }),
      markAsChanged: () => set({ hasUnsavedChanges: true }),
      markAsSaved: () => set({ hasUnsavedChanges: false }),

      // UI actions
      setActiveTab: (tab) => set({ activeTab: tab }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      // Reset
      reset: () => set({
        currentPrompt: null,
        isEditing: false,
        hasUnsavedChanges: false,
        activeTab: 'editor',
        sidebarCollapsed: false,
      }),
    }),
    { name: 'prompt-store' }
  )
);

// Helper function to ensure all content items have IDs
function ensureContentIds(content: any): any {
  if (!content) return content;

  const result = { ...content };

  if (result.segments) {
    result.segments = result.segments.map((segment: any, index: number) => ({
      id: segment.id || generateId(),
      order: segment.order ?? index,
      ...segment,
    }));
  }

  if (result.sections) {
    result.sections = result.sections.map((section: any, index: number) => ({
      id: section.id || generateId(),
      order: section.order ?? index,
      ...section,
    }));
  }

  if (result.modules) {
    result.modules = result.modules.map((module: any, index: number) => ({
      id: module.id || generateId(),
      order: module.order ?? index,
      ...module,
    }));
  }

  if (result.blocks) {
    result.blocks = result.blocks.map((block: any, index: number) => ({
      id: block.id || generateId(),
      order: block.order ?? index,
      modules: block.modules?.map((module: any, moduleIndex: number) => ({
        id: module.id || generateId(),
        order: module.order ?? moduleIndex,
        ...module,
      })) || [],
      ...block,
    }));
  }

  return result;
}