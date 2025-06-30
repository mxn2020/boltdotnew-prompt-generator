import React from 'react';
import { Sliders } from 'lucide-react';
import type { StructureType, Complexity } from '../../types/prompt';

interface PromptConfigPanelProps {
  config: {
    structure_type: StructureType;
    complexity: Complexity;
    category: string;
    type: string;
    language: string;
  };
  onChange: (config: any) => void;
}

export function PromptConfigPanel({ config, onChange }: PromptConfigPanelProps) {
  const updateConfig = (field: string, value: any) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <div className="p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Sliders className="w-4 h-4 text-indigo-600" />
        <h3 className="font-medium text-gray-900">Prompt Configuration</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Structure Type
          </label>
          <select
            value={config.structure_type}
            onChange={(e) => updateConfig('structure_type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="standard">Standard (Segments)</option>
            <option value="structured">Structured (Sections)</option>
            <option value="modulized">Modulized (Modules)</option>
            <option value="advanced">Advanced (Blocks)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Complexity
          </label>
          <select
            value={config.complexity}
            onChange={(e) => updateConfig('complexity', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="simple">Simple</option>
            <option value="medium">Medium</option>
            <option value="complex">Complex</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={config.category}
            onChange={(e) => updateConfig('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ai">AI Assistant</option>
            <option value="web">Web Development</option>
            <option value="data">Data Analysis</option>
            <option value="creative">Creative Writing</option>
            <option value="business">Business</option>
            <option value="research">Research</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            value={config.type}
            onChange={(e) => updateConfig('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="assistant">Assistant</option>
            <option value="analyzer">Analyzer</option>
            <option value="generator">Generator</option>
            <option value="optimizer">Optimizer</option>
            <option value="tool">Tool</option>
            <option value="agent">Agent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Language
          </label>
          <select
            value={config.language}
            onChange={(e) => updateConfig('language', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="english">English</option>
            <option value="french">French</option>
            <option value="german">German</option>
            <option value="spanish">Spanish</option>
          </select>
        </div>
      </div>
    </div>
  );
}