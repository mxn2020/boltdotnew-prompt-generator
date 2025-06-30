import React from 'react';
import { Clock, GitBranch, Eye, RotateCcw, Plus, Tag, User } from 'lucide-react';
import { formatDateTime } from '../../lib/format-utils';
import { cn } from '../../lib/utils';
import type { PromptVersion } from '../../types/version';

interface VersionHistoryProps {
  versions: PromptVersion[];
  currentVersion?: PromptVersion;
  onSelectVersion: (version: PromptVersion) => void;
  onRestoreVersion: (version: PromptVersion) => void;
  onCreateVersion: (type: 'major' | 'minor') => void;
  onCompareVersions: (from: PromptVersion, to: PromptVersion) => void;
}

export function VersionHistory({
  versions,
  currentVersion,
  onSelectVersion,
  onRestoreVersion,
  onCreateVersion,
  onCompareVersions,
}: VersionHistoryProps) {
  const [selectedVersions, setSelectedVersions] = React.useState<PromptVersion[]>([]);

  const handleVersionSelect = (version: PromptVersion) => {
    if (selectedVersions.length === 0) {
      setSelectedVersions([version]);
    } else if (selectedVersions.length === 1) {
      if (selectedVersions[0].id === version.id) {
        setSelectedVersions([]);
      } else {
        setSelectedVersions([selectedVersions[0], version]);
      }
    } else {
      setSelectedVersions([version]);
    }
  };

  const handleCompare = () => {
    if (selectedVersions.length === 2) {
      onCompareVersions(selectedVersions[0], selectedVersions[1]);
    }
  };

  const getVersionTypeColor = (version: PromptVersion) => {
    if (version.version_batch > 0) return 'bg-gray-100 text-gray-700';
    if (version.version_minor > 0) return 'bg-blue-100 text-blue-700';
    return 'bg-green-100 text-green-700';
  };

  const getVersionTypeLabel = (version: PromptVersion) => {
    if (version.version_batch > 0) return 'Patch';
    if (version.version_minor > 0) return 'Minor';
    return 'Major';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Version History</h3>
          </div>
          <div className="flex items-center space-x-2">
            {selectedVersions.length === 2 && (
              <button
                onClick={handleCompare}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
              >
                <GitBranch className="w-3 h-3" />
                <span>Compare</span>
              </button>
            )}
            <button
              onClick={() => onCreateVersion('minor')}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>New Version</span>
            </button>
          </div>
        </div>

        {selectedVersions.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              {selectedVersions.length === 1
                ? `Selected: v${selectedVersions[0].version_major}.${selectedVersions[0].version_minor}.${selectedVersions[0].version_batch}`
                : `Comparing: v${selectedVersions[0].version_major}.${selectedVersions[0].version_minor}.${selectedVersions[0].version_batch} ↔ v${selectedVersions[1].version_major}.${selectedVersions[1].version_minor}.${selectedVersions[1].version_batch}`
              }
            </p>
          </div>
        )}
      </div>

      {/* Version List */}
      <div className="max-h-96 overflow-y-auto">
        {versions.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No version history</h4>
            <p className="text-gray-600 mb-4">
              Version history will appear here as you make changes to your prompt.
            </p>
            <button
              onClick={() => onCreateVersion('major')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create First Version
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {versions.map((version, index) => {
              const isSelected = selectedVersions.some(v => v.id === version.id);
              const isCurrent = currentVersion?.id === version.id;
              
              return (
                <div
                  key={version.id}
                  className={cn(
                    'p-4 hover:bg-gray-50 transition-colors cursor-pointer',
                    isSelected && 'bg-blue-50 border-l-4 border-blue-500',
                    isCurrent && 'bg-green-50'
                  )}
                  onClick={() => handleVersionSelect(version)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-mono text-lg font-semibold text-gray-900">
                          v{version.version_major}.{version.version_minor}.{version.version_batch}
                        </span>
                        
                        <span className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          getVersionTypeColor(version)
                        )}>
                          {getVersionTypeLabel(version)}
                        </span>

                        {isCurrent && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            Current
                          </span>
                        )}
                      </div>

                      <h4 className="font-medium text-gray-900 mb-1">{version.title}</h4>
                      
                      {version.description && (
                        <p className="text-sm text-gray-600 mb-2">{version.description}</p>
                      )}

                      {version.changelog && (
                        <p className="text-sm text-gray-500 mb-2 italic">{version.changelog}</p>
                      )}

                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>You</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDateTime(version.created_at)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Tag className="w-3 h-3" />
                          <span>{version.structure_type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectVersion(version);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View version"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {!isCurrent && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRestoreVersion(version);
                          }}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="Restore version"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}