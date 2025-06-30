import React from 'react';
import { Plus, GripVertical, X, ChevronDown, ChevronRight, Hash } from 'lucide-react';
import { usePromptStore } from '../../../stores/promptStore';
import type { PromptSection } from '../../../types/prompt';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
        <div className="space-y-1">
          <h3 className="text-2xl font-bold tracking-tight">Structured Prompt Sections</h3>
          <p className="text-muted-foreground">
            Organize your prompt into titled sections with hierarchical structure.
          </p>
        </div>
        <Button onClick={handleAddSection} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Section
        </Button>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                <Hash className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold mb-2">No sections yet</h4>
              <p className="text-muted-foreground mb-4 text-center max-w-md">
                Create structured prompts with organized sections and subsections.
              </p>
              <Button onClick={handleAddSection} className="gap-2">
                <Plus className="h-4 w-4" />
                Add First Section
              </Button>
            </CardContent>
          </Card>
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
        <Alert className="border-green-200 bg-green-50">
          <Hash className="h-4 w-4" />
          <AlertDescription className="text-green-800">
            <div className="font-medium mb-2">💡 Tips for Structured Prompts</div>
            <ul className="space-y-1 text-sm">
              <li>• Use clear, descriptive section titles</li>
              <li>• Organize related information into logical groups</li>
              <li>• Consider using sections like: Context, Instructions, Examples, Constraints</li>
              <li>• Keep sections focused on a single topic or purpose</li>
            </ul>
          </AlertDescription>
        </Alert>
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
    <Card 
      className="border-green-200 shadow-sm"
      style={{ marginLeft: level * 20 }}
    >
      {/* Section Header */}
      <CardHeader className="bg-green-50/50 border-b border-green-200 pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="cursor-grab p-1">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </Button>
          
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-1">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>

          <Hash className="h-4 w-4 text-green-600" />

          <Input
            value={section.title}
            onChange={(e) => onUpdate(section.id, 'title', e.target.value)}
            placeholder="Section title..."
            className="flex-1 h-8 font-medium border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-green-500"
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="p-1 text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Section Content */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleContent>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor={`desc-${section.id}`}>Description (optional)</Label>
                <Input
                  id={`desc-${section.id}`}
                  value={section.description || ''}
                  onChange={(e) => onUpdate(section.id, 'description', e.target.value)}
                  placeholder="Brief description of this section..."
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor={`content-${section.id}`}>Content</Label>
                <Textarea
                  id={`content-${section.id}`}
                  value={section.content}
                  onChange={(e) => onUpdate(section.id, 'content', e.target.value)}
                  placeholder="Enter section content..."
                  className="min-h-[120px] resize-none"
                />
                <div className="flex justify-end">
                  <span className="text-xs text-muted-foreground">
                    {section.content.length} characters
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}