import React from 'react';
import { Plus, GripVertical, X, MessageSquare } from 'lucide-react';
import { usePromptStore } from '../../../stores/promptStore';
import type { PromptSegment } from '../../../types/prompt';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const segmentTypes = [
  { value: 'system', label: 'System', description: 'System instructions and context', color: 'bg-blue-100 text-blue-800' },
  { value: 'user', label: 'User', description: 'User input and queries', color: 'bg-green-100 text-green-800' },
  { value: 'assistant', label: 'Assistant', description: 'Assistant responses and examples', color: 'bg-purple-100 text-purple-800' },
  { value: 'context', label: 'Context', description: 'Background information', color: 'bg-amber-100 text-amber-800' },
  { value: 'instruction', label: 'Instruction', description: 'Specific task instructions', color: 'bg-indigo-100 text-indigo-800' },
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
    console.log('handleUpdateSegment called:', id, field, value);
    updateSegment(id, { [field]: value });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold tracking-tight">Standard Prompt Segments</h3>
          <p className="text-muted-foreground">
            Build your prompt using individual segments for different purposes.
          </p>
        </div>
        <Button onClick={handleAddSegment} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Segment
        </Button>
      </div>

      {/* Segments */}
      <div className="space-y-4">
        {segments.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold mb-2">No segments yet</h4>
              <p className="text-muted-foreground mb-4 text-center max-w-md">
                Start building your prompt by adding your first segment.
              </p>
              <Button onClick={handleAddSegment} className="gap-2">
                <Plus className="h-4 w-4" />
                Add First Segment
              </Button>
            </CardContent>
          </Card>
        ) : (
          segments.map((segment, index) => (
            <Card key={segment.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                {/* Segment Header */}
                <div className="flex items-center gap-3 mb-4">
                  <Button variant="ghost" size="sm" className="cursor-grab p-1">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  
                  <Select
                    value={segment.type}
                    onValueChange={(value) => handleUpdateSegment(segment.id, 'type', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {segmentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={`text-xs ${type.color}`}>
                              {type.label}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <span className="text-sm text-muted-foreground flex-1">
                    {segmentTypes.find(t => t.value === segment.type)?.description}
                  </span>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSegment(segment.id)}
                    className="p-1 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Segment Content */}
                <div className="space-y-2">
                  <Textarea
                    value={segment.content}
                    onChange={(e) => handleUpdateSegment(segment.id, 'content', e.target.value)}
                    placeholder={`Enter ${segment.type} content...`}
                    className="min-h-[120px] resize-none"
                  />

                  {/* Character count */}
                  <div className="flex justify-end">
                    <span className="text-xs text-muted-foreground">
                      {segment.content.length} characters
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Tips */}
      {segments.length > 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <MessageSquare className="h-4 w-4" />
          <AlertDescription className="text-blue-800">
            <div className="font-medium mb-2">💡 Tips for Standard Prompts</div>
            <ul className="space-y-1 text-sm">
              <li>• Start with a system segment to set the context and role</li>
              <li>• Use instruction segments for specific tasks and requirements</li>
              <li>• Add context segments for background information</li>
              <li>• Include examples in assistant segments for better results</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}