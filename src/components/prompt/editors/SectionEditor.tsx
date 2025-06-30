import React from 'react';
import { Plus, GripVertical, X, ChevronDown, ChevronRight } from 'lucide-react';
import { usePromptStore } from '../../../stores/promptStore';
import type { PromptSection } from '../../../types/prompt';

export function SectionEditor() {
  const { 
    currentPrompt, 
    addSection, 
    updateSection, 
    removeSection, 
    reorderSections 
  } = usePromptStore();

  const sections = currentPrompt?.content?.sections || [];

  const handleAddSection = () => {
    addSection({
      title: '',
      content: '',
    });
  };

  const handleUpdateSection = (id: string, field: keyof PromptSection, value: any) => {
    updateSection(id, { [field]: value });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Structured Prompt Sections</h3>
          <p className="text-sm text-gray-600">
            Organize your prompt into titled sections with hierarchical structure.
          </p>
        </div>
        <button
          onClick={handleAddSection}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Section</span>
        </button>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <h4 className="text-lg font-medium text-gray-900 mb-2">No sections yet</h4>
            <p className="text-gray-600 mb-4">
              Create structured prompts with organized sections and subsections.
            </p>
            <button
              onClick={handleAddSection}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Section</span>
            </button>
          </div>
        ) : (
          sections.map((section, index) => (
            <SectionItem
              key={section.id}
              section={section}
              onUpdate={handleUpdateSection}
              onRemove={() => removeSection(section.id)}
            />
          ))
        )}
      </div>

      {/* Tips */}
      {sections.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-900 mb-2">💡 Tips for Structured Prompts</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Use clear, descriptive section titles</li>
            <li>• Organize related information into logical groups</li>
            <li>• Consider using sections like: Context, Instructions, Examples, Constraints</li>
            <li>• Keep sections focused on a single topic or purpose</li>
          </ul>
        </div>
      )}
    </div>
  );
}

interface SectionItemProps {
  section: PromptSection;
  onUpdate: (id: string, field: keyof PromptSection, value: any) => void;
  onRemove: () => void;
  level?: number;
}

function SectionItem({ section, onUpdate, onRemove, level = 0 }: SectionItemProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg overflow-hidden"
      style={{ marginLeft: level * 20 }}
    >
      {/* Section Header */}
      <div className="flex items-center space-x-3 p-4 bg-gray-50 border-b border-gray-200">
        <button className="text-gray-400 hover:text-gray-600 cursor-grab">
          <GripVertical className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-600 hover:text-gray-800"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        <input
          type="text"
          value={section.title}
          onChange={(e) => onUpdate(section.id, 'title', e.target.value)}
          placeholder="Section title..."
          className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-red-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Section Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <input
              type="text"
              value={section.description || ''}
              onChange={(e) => onUpdate(section.id, 'description', e.target.value)}
              placeholder="Brief description of this section..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              value={section.content}
              onChange={(e) => onUpdate(section.id, 'content', e.target.value)}
              placeholder="Enter section content..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex justify-end mt-1">
              <span className="text-xs text-gray-500">
                {section.content.length} characters
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}