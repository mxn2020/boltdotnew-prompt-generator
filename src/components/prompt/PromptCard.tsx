import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Eye, 
  Heart, 
  GitFork, 
  Calendar, 
  User, 
  Lock, 
  Globe,
  MoreHorizontal,
  Edit,
  Copy,
  Trash2
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { formatDate, truncateText } from '../../lib/utils';
import { cn } from '../../lib/utils';
import type { Prompt } from '../../types/prompt';

interface PromptCardProps {
  prompt: Prompt;
  onEdit?: (prompt: Prompt) => void;
  onClone?: (prompt: Prompt) => void;
  onDelete?: (prompt: Prompt) => void;
  showAuthor?: boolean;
  variant?: 'default' | 'compact';
}

const structureTypeColors = {
  standard: 'bg-blue-100 text-blue-800',
  structured: 'bg-green-100 text-green-800',
  modulized: 'bg-purple-100 text-purple-800',
  advanced: 'bg-orange-100 text-orange-800',
};

const complexityColors = {
  simple: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  complex: 'bg-red-100 text-red-800',
};

export function PromptCard({ 
  prompt, 
  onEdit, 
  onClone, 
  onDelete, 
  showAuthor = true,
  variant = 'default' 
}: PromptCardProps) {
  const isCompact = variant === 'compact';

  return (
    <div className={cn(
      'bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors',
      isCompact ? 'p-4' : 'p-6'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <Link 
            to={`/studio?prompt=${prompt.id}`}
            className="block group"
          >
            <h3 className={cn(
              'font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors',
              isCompact ? 'text-sm' : 'text-lg'
            )}>
              {truncateText(prompt.title, isCompact ? 40 : 60)}
            </h3>
          </Link>
          
          {prompt.description && (
            <p className={cn(
              'text-gray-600 mt-1',
              isCompact ? 'text-xs' : 'text-sm'
            )}>
              {truncateText(prompt.description, isCompact ? 80 : 120)}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2 ml-4">
          {/* Privacy indicator */}
          <div className="flex items-center">
            {prompt.is_public ? (
              <Globe className="w-4 h-4 text-green-600" />
            ) : (
              <Lock className="w-4 h-4 text-gray-400" />
            )}
          </div>

          {/* Actions menu */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[160px] bg-white rounded-lg shadow-lg border border-gray-200 p-1 z-50"
                sideOffset={5}
              >
                {onEdit && (
                  <DropdownMenu.Item
                    onClick={() => onEdit(prompt)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </DropdownMenu.Item>
                )}

                {onClone && (
                  <DropdownMenu.Item
                    onClick={() => onClone(prompt)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Clone</span>
                  </DropdownMenu.Item>
                )}

                {onDelete && (
                  <>
                    <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
                    <DropdownMenu.Item
                      onClick={() => onDelete(prompt)}
                      className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </DropdownMenu.Item>
                  </>
                )}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={cn(
          'px-2 py-1 rounded-full text-xs font-medium',
          structureTypeColors[prompt.structure_type]
        )}>
          {prompt.structure_type}
        </span>
        
        <span className={cn(
          'px-2 py-1 rounded-full text-xs font-medium',
          complexityColors[prompt.complexity]
        )}>
          {prompt.complexity}
        </span>

        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
          {prompt.category}
        </span>

        {prompt.tags.slice(0, 2).map((tag) => (
          <span 
            key={tag}
            className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium"
          >
            {tag}
          </span>
        ))}

        {prompt.tags.length > 2 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
            +{prompt.tags.length - 2}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          {showAuthor && (
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span className="text-xs">You</span>
            </div>
          )}
          
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span className="text-xs">{formatDate(prompt.updated_at)}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <Eye className="w-3 h-3" />
            <span className="text-xs">{prompt.view_count}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Heart className="w-3 h-3" />
            <span className="text-xs">{prompt.like_count}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <GitFork className="w-3 h-3" />
            <span className="text-xs">{prompt.fork_count}</span>
          </div>
        </div>
      </div>

      {/* Version info */}
      <div className="mt-2 pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-400">
          v{prompt.version_major}.{prompt.version_minor}.{prompt.version_batch}
        </span>
      </div>
    </div>
  );
}