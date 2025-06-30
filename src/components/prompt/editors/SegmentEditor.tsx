import React from 'react';
import { Plus, GripVertical, X } from 'lucide-react';
import { usePromptStore } from '../../../stores/promptStore';
import type { PromptSegment } from '../../../types/prompt';

const segmentTypes = [
  { value: 'system', label: 'System', description: 'System instructions and context' },
  { value: 'user', label: 'User', description: 'User input and queries' },
  { value: 'assistant', label: 'Assistant', description: 'Assistant responses and examples' },
  { value: 'context', label: 'Context', description: 'Background information' },
  { value: 'instruction', label: 'Instruction', description: 'Specific task instructions' },
];

export function SegmentEditor() {
  const { 
    currentPrompt, 
    addSegment, 
    updateSegment, 
    removeSegment, 
    reorderSegments 
  } = usePromptStore();

  const segments = currentPrompt?.content?.segments || [];

  const handleAddSegment = () => {
    addSegment({
      type: 'instruction',
      content: '',
    });
  };

  const handleUpdateSegment = (id: string, field: keyof PromptSegment, value: any) => {
    updateSegment(id, { [field]: value });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Standard Prompt Segments</h3>
          <p className="text-sm text-gray-600">
            Build your prompt using individual segments for different purposes.
          </p>
        </div>
        <button
          onClick={handleAddSegment}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Segment</span>
        </button>
      </div>

      {/* Segments */}
      <div className="space-y-4">
        {segments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <h4 className="text-lg font-medium text-gray-900 mb-2">No segments yet</h4>
            <p className="text-gray-600 mb-4">
              Start building your prompt by adding your first segment.
            </p>
            <button
              onClick={handleAddSegment}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Segment</span>
            </button>
          </div>
        ) : (
          segments.map((segment, index) => (
            <div
              key={segment.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              {/* Segment Header */}
              <div className="flex items-center space-x-3 mb-3">
                <button className="text-gray-400 hover:text-gray-600 cursor-grab">
                  <GripVertical className="w-4 h-4" />
                </button>
                
                <select
                  value={segment.type}
                  onChange={(e) => handleUpdateSegment(segment.id, 'type', e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {segmentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>

                <span className="text-sm text-gray-500 flex-1">
                  {segmentTypes.find(t => t.value === segment.type)?.description}
                </span>

                <button
                  onClick={() => removeSegment(segment.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Segment Content */}
              <textarea
                value={segment.content}
                onChange={(e) => handleUpdateSegment(segment.id, 'content', e.target.value)}
                placeholder={`Enter ${segment.type} content...`}
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />

              {/* Character count */}
              <div className="flex justify-end mt-2">
                <span className="text-xs text-gray-500">
                  {segment.content.length} characters
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tips */}
      {segments.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Tips for Standard Prompts</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Start with a system segment to set the context and role</li>
            <li>• Use instruction segments for specific tasks and requirements</li>
            <li>• Add context segments for background information</li>
            <li>• Include examples in assistant segments for better results</li>
          </ul>
        </div>
      )}
    </div>
  );
}