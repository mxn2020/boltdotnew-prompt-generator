import React from 'react';
import { Download, Settings, FileText, Code, Globe, Database } from 'lucide-react';
import { EXPORT_FORMATS, ExportEngine } from '../../lib/export/formats';
import { cn } from '../../lib/utils';
import type { Prompt } from '../../types/prompt';
import type { ExportOptions, ExportResult } from '../../types/version';

interface ExportDialogProps {
  prompt: Prompt;
  onClose: () => void;
  onExport: (result: ExportResult) => void;
}

export function ExportDialog({ prompt, onClose, onExport }: ExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = React.useState('markdown');
  const [options, setOptions] = React.useState<ExportOptions>({
    format: 'markdown',
    includeMetadata: true,
    includeVersionInfo: true,
    formatting: {
      indentation: 2,
      lineBreaks: true,
      comments: true,
    },
  });
  const [isExporting, setIsExporting] = React.useState(false);
  const [preview, setPreview] = React.useState<string>('');

  const selectedFormatConfig = EXPORT_FORMATS.find(f => f.id === selectedFormat);

  React.useEffect(() => {
    setOptions(prev => ({ ...prev, format: selectedFormat }));
  }, [selectedFormat]);

  React.useEffect(() => {
    generatePreview();
  }, [options, prompt]);

  const generatePreview = async () => {
    try {
      const result = await ExportEngine.exportPrompt(prompt, options);
      setPreview(result.content.substring(0, 1000) + (result.content.length > 1000 ? '...' : ''));
    } catch (error) {
      setPreview('Error generating preview');
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await ExportEngine.exportPrompt(prompt, options);
      onExport(result);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getFormatIcon = (formatId: string) => {
    switch (formatId) {
      case 'plain-text':
      case 'markdown':
        return FileText;
      case 'html':
      case 'xml':
        return Globe;
      case 'json':
      case 'yaml':
        return Database;
      case 'prompty':
        return Code;
      default:
        return FileText;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Export Prompt</h2>
              <p className="text-sm text-gray-600 mt-1">
                Export "{prompt.title}" in your preferred format
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-120px)]">
          {/* Left Panel - Format Selection & Options */}
          <div className="w-1/2 p-6 border-r border-gray-200 overflow-y-auto">
            {/* Format Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Export Format</h3>
              <div className="grid grid-cols-1 gap-3">
                {EXPORT_FORMATS.map((format) => {
                  const Icon = getFormatIcon(format.id);
                  return (
                    <button
                      key={format.id}
                      onClick={() => setSelectedFormat(format.id)}
                      className={cn(
                        'p-4 rounded-lg border text-left transition-all',
                        selectedFormat === format.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={cn(
                          'w-5 h-5',
                          selectedFormat === format.id ? 'text-indigo-600' : 'text-gray-400'
                        )} />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{format.name}</div>
                          <div className="text-sm text-gray-600">{format.description}</div>
                          <div className="text-xs text-gray-500 mt-1">.{format.extension}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Export Options */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Export Options</h3>
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={options.includeMetadata}
                    onChange={(e) => setOptions(prev => ({ ...prev, includeMetadata: e.target.checked }))}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Include Metadata</div>
                    <div className="text-sm text-gray-600">Category, type, complexity, tags</div>
                  </div>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={options.includeVersionInfo}
                    onChange={(e) => setOptions(prev => ({ ...prev, includeVersionInfo: e.target.checked }))}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Include Version Info</div>
                    <div className="text-sm text-gray-600">Version number and creation date</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Formatting Options */}
            {selectedFormatConfig?.supportsCustomization && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Formatting</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Indentation
                    </label>
                    <select
                      value={options.formatting?.indentation || 2}
                      onChange={(e) => setOptions(prev => ({
                        ...prev,
                        formatting: { ...prev.formatting, indentation: parseInt(e.target.value) }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={2}>2 spaces</option>
                      <option value={4}>4 spaces</option>
                      <option value={8}>8 spaces</option>
                    </select>
                  </div>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={options.formatting?.lineBreaks ?? true}
                      onChange={(e) => setOptions(prev => ({
                        ...prev,
                        formatting: { ...prev.formatting, lineBreaks: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Extra Line Breaks</div>
                      <div className="text-sm text-gray-600">Add spacing between sections</div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={options.formatting?.comments ?? true}
                      onChange={(e) => setOptions(prev => ({
                        ...prev,
                        formatting: { ...prev.formatting, comments: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Include Comments</div>
                      <div className="text-sm text-gray-600">Add explanatory comments</div>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className="w-1/2 p-6 overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Preview</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-full">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                {preview}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Format: <span className="font-medium">{selectedFormatConfig?.name}</span>
            {selectedFormatConfig && (
              <span className="ml-2">(.{selectedFormatConfig.extension})</span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Exporting...' : 'Export'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}