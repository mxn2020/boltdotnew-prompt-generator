import React from 'react';
import { ArrowRight, Plus, Minus, Edit, Info } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { VersionComparison, VersionChange } from '../../types/version';

interface DiffViewerProps {
  comparison: VersionComparison;
  onClose: () => void;
}

export function DiffViewer({ comparison, onClose }: DiffViewerProps) {
  const { from, to, changes } = comparison;

  const getChangeIcon = (type: VersionChange['type']) => {
    switch (type) {
      case 'added':
        return <Plus className="w-4 h-4 text-green-600" />;
      case 'removed':
        return <Minus className="w-4 h-4 text-red-600" />;
      case 'modified':
        return <Edit className="w-4 h-4 text-blue-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const getChangeColor = (type: VersionChange['type']) => {
    switch (type) {
      case 'added':
        return 'bg-green-50 border-green-200';
      case 'removed':
        return 'bg-red-50 border-red-200';
      case 'modified':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const renderValue = (value: any) => {
    if (typeof value === 'string') {
      return value.length > 100 ? `${value.substring(0, 100)}...` : value;
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Version Comparison</h2>
              <div className="flex items-center space-x-2 mt-1 text-sm text-gray-600">
                <span className="font-mono">
                  v{from.version_major}.{from.version_minor}.{from.version_batch}
                </span>
                <ArrowRight className="w-4 h-4" />
                <span className="font-mono">
                  v{to.version_major}.{to.version_minor}.{to.version_batch}
                </span>
              </div>
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {changes.length === 0 ? (
            <div className="text-center py-12">
              <Info className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Changes Detected</h3>
              <p className="text-gray-600">
                These versions appear to be identical.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Summary</h3>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-1">
                    <Plus className="w-4 h-4 text-green-600" />
                    <span>{changes.filter(c => c.type === 'added').length} additions</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Minus className="w-4 h-4 text-red-600" />
                    <span>{changes.filter(c => c.type === 'removed').length} removals</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Edit className="w-4 h-4 text-blue-600" />
                    <span>{changes.filter(c => c.type === 'modified').length} modifications</span>
                  </div>
                </div>
              </div>

              {/* Changes */}
              <div className="space-y-3">
                {changes.map((change, index) => (
                  <div
                    key={index}
                    className={cn(
                      'border rounded-lg p-4',
                      getChangeColor(change.type)
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      {getChangeIcon(change.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-900">{change.path}</span>
                          <span className={cn(
                            'px-2 py-1 rounded-full text-xs font-medium',
                            change.type === 'added' && 'bg-green-100 text-green-700',
                            change.type === 'removed' && 'bg-red-100 text-red-700',
                            change.type === 'modified' && 'bg-blue-100 text-blue-700'
                          )}>
                            {change.type}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-3">{change.description}</p>

                        {/* Value comparison */}
                        {(change.oldValue !== undefined || change.newValue !== undefined) && (
                          <div className="space-y-2">
                            {change.oldValue !== undefined && (
                              <div className="bg-red-50 border border-red-200 rounded p-3">
                                <div className="text-xs font-medium text-red-700 mb-1">Before</div>
                                <pre className="text-sm text-red-800 whitespace-pre-wrap">
                                  {renderValue(change.oldValue)}
                                </pre>
                              </div>
                            )}
                            
                            {change.newValue !== undefined && (
                              <div className="bg-green-50 border border-green-200 rounded p-3">
                                <div className="text-xs font-medium text-green-700 mb-1">After</div>
                                <pre className="text-sm text-green-800 whitespace-pre-wrap">
                                  {renderValue(change.newValue)}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}