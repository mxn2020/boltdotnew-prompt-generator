import React from 'react';
import { Settings, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export type PromptType = 'prompt' | 'context' | 'response_schema' | 'response_examples' | 'persona' | 'instructions' | 'constraints' | 'examples';
export type StructureType = 'standard' | 'structured' | 'modulized' | 'advanced';
export type Complexity = 'simple' | 'medium' | 'complex';

interface PromptConfigurationPanelProps {
  config: {
    prompt_type: PromptType;
    structure_type: StructureType;
    complexity: Complexity;
    category: string;
    type: string;
    language: string;
  };
  onChange: (config: any) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function PromptConfigurationPanel({ config, onChange, isOpen, onToggle }: PromptConfigurationPanelProps) {
  const updateConfig = (field: string, value: any) => {
    onChange({ ...config, [field]: value });
  };

  const promptTypeOptions = [
    { value: 'prompt', label: 'Standard Prompt', description: 'General purpose prompt', icon: '💬' },
    { value: 'context', label: 'Context Setting', description: 'Background information', icon: '🌐' },
    { value: 'response_schema', label: 'Response Schema', description: 'Output format definition', icon: '📋' },
    { value: 'response_examples', label: 'Response Examples', description: 'Example outputs', icon: '📝' },
    { value: 'persona', label: 'Persona Definition', description: 'Character or role definition', icon: '🎭' },
    { value: 'instructions', label: 'Instructions', description: 'Step-by-step guidance', icon: '📖' },
    { value: 'constraints', label: 'Constraints', description: 'Rules and limitations', icon: '⚠️' },
    { value: 'examples', label: 'Examples', description: 'Input/output examples', icon: '💡' }
  ];

  const structureOptions = [
    { value: 'standard', label: 'Standard', description: 'Basic segments structure', icon: '📄' },
    { value: 'structured', label: 'Structured', description: 'Organized sections', icon: '🗂️' },
    { value: 'modulized', label: 'Modulized', description: 'Reusable modules', icon: '🧩' },
    { value: 'advanced', label: 'Advanced', description: 'Complex blocks', icon: '⚡' }
  ];

  const complexityOptions = [
    { value: 'simple', label: 'Simple', description: 'Basic prompts', color: 'bg-green-100 text-green-800 border-green-200' },
    { value: 'medium', label: 'Medium', description: 'Intermediate complexity', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { value: 'complex', label: 'Complex', description: 'Advanced prompts', color: 'bg-red-100 text-red-800 border-red-200' }
  ];

  const categoryOptions = [
    { value: 'ai', label: 'AI Assistant', icon: '🤖' },
    { value: 'web', label: 'Web Development', icon: '💻' },
    { value: 'data', label: 'Data Analysis', icon: '📊' },
    { value: 'creative', label: 'Creative Writing', icon: '✍️' },
    { value: 'business', label: 'Business', icon: '💼' },
    { value: 'research', label: 'Research', icon: '🔬' }
  ];

  const typeOptions = [
    { value: 'assistant', label: 'Assistant', description: 'Helpful AI assistant' },
    { value: 'analyzer', label: 'Analyzer', description: 'Analysis and insights' },
    { value: 'generator', label: 'Generator', description: 'Content generation' },
    { value: 'optimizer', label: 'Optimizer', description: 'Optimization tasks' },
    { value: 'tool', label: 'Tool', description: 'Specialized tool' },
    { value: 'agent', label: 'Agent', description: 'Autonomous agent' }
  ];

  const languageOptions = [
    { value: 'english', label: 'English', flag: '🇺🇸' },
    { value: 'french', label: 'French', flag: '🇫🇷' },
    { value: 'german', label: 'German', flag: '🇩🇪' },
    { value: 'spanish', label: 'Spanish', flag: '🇪🇸' }
  ];

  const getComplexityColor = (complexity: string) => {
    const option = complexityOptions.find(o => o.value === complexity);
    return option?.color || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const resetToDefaults = () => {
    onChange({
      prompt_type: 'prompt',
      structure_type: 'standard',
      complexity: 'simple',
      category: 'ai',
      type: 'assistant',
      language: 'english'
    });
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div>
        <h3 className="font-medium flex items-center">
          <Sliders className="w-4 h-4 mr-2" />
          Prompt Configuration
        </h3>
        <p className="text-sm text-muted-foreground">Customize generation parameters</p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Prompt Type */}
          <div className="space-y-2">
            <Label htmlFor="prompt-type" className="text-sm font-medium">
              Prompt Type
            </Label>
            <Select 
              value={config.prompt_type} 
              onValueChange={(value) => updateConfig('prompt_type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {promptTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center space-x-2">
                      <span>{option.icon}</span>
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Structure Type */}
          <div className="space-y-2">
            <Label htmlFor="structure-type" className="text-sm font-medium">
              Structure Type
            </Label>
            <Select 
              value={config.structure_type} 
              onValueChange={(value) => updateConfig('structure_type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {structureOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center space-x-2">
                      <span>{option.icon}</span>
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Complexity */}
          <div className="space-y-2">
            <Label htmlFor="complexity" className="text-sm font-medium">
              Complexity Level
            </Label>
            <Select 
              value={config.complexity} 
              onValueChange={(value) => updateConfig('complexity', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {complexityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Category
            </Label>
            <Select 
              value={config.category} 
              onValueChange={(value) => updateConfig('category', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center space-x-2">
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium">
              Type
            </Label>
            <Select 
              value={config.type} 
              onValueChange={(value) => updateConfig('type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="language" className="text-sm font-medium">
              Language
            </Label>
            <Select 
              value={config.language} 
              onValueChange={(value) => updateConfig('language', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center space-x-2">
                      <span>{option.flag}</span>
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Configuration Summary */}
          <div className="pt-4 border-t space-y-3">
            <Label className="text-sm font-medium">Active Configuration</Label>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={getComplexityColor(config.complexity)}>
                {config.complexity}
              </Badge>
              <Badge variant="outline">
                {promptTypeOptions.find(p => p.value === config.prompt_type)?.icon} {promptTypeOptions.find(p => p.value === config.prompt_type)?.label}
              </Badge>
              <Badge variant="outline">
                {structureOptions.find(s => s.value === config.structure_type)?.icon} {structureOptions.find(s => s.value === config.structure_type)?.label}
              </Badge>
              <Badge variant="outline">
                {categoryOptions.find(c => c.value === config.category)?.icon} {categoryOptions.find(c => c.value === config.category)?.label}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t">
        <Button 
          variant="outline" 
          size="sm"
          onClick={resetToDefaults}
        >
          Reset to Defaults
        </Button>
        <Button onClick={onToggle} variant="default" size="sm">
          Apply Configuration
        </Button>
      </div>
    </div>
  );
}