import React from 'react';
import { Download, FileText, Code, Globe, Database, Copy, Check, X } from 'lucide-react';
import { EXPORT_FORMATS, ExportEngine } from '../../lib/export/formats';
import { cn } from '../../lib/utils';
import type { Prompt } from '../../types/prompt';
import type { ExportOptions, ExportResult } from '../../types/version';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";

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

  const [copied, setCopied] = React.useState(false);

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

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(preview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Export Prompt</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Export "{prompt.title}" in your preferred format
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden h-[calc(90vh-180px)]">
          {/* Left Panel - Format Selection & Options */}
          <div className="overflow-y-auto pr-2">
            <Tabs defaultValue="format" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="format">Format</TabsTrigger>
                <TabsTrigger value="options">Options</TabsTrigger>
              </TabsList>

              <TabsContent value="format" className="mt-0 space-y-4">
                <div className="space-y-4">
                  <Label className="text-base font-medium">Export Format</Label>
                  <RadioGroup 
                    value={selectedFormat} 
                    onValueChange={setSelectedFormat}
                    className="grid grid-cols-1 gap-3"
                  >
                    {EXPORT_FORMATS.map((format) => {
                      const Icon = getFormatIcon(format.id);
                      return (
                        <label
                          key={format.id}
                          className={cn(
                            'flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all',
                            selectedFormat === format.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50 hover:bg-muted/50'
                          )}
                        >
                          <RadioGroupItem value={format.id} id={format.id} className="sr-only" />
                          <Icon className={cn(
                            'w-5 h-5 flex-shrink-0',
                            selectedFormat === format.id ? 'text-primary' : 'text-muted-foreground'
                          )} />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{format.name}</div>
                            <div className="text-sm text-muted-foreground">{format.description}</div>
                            <Badge variant="outline" className="mt-1 text-xs">
                              .{format.extension}
                            </Badge>
                          </div>
                        </label>
                      );
                    })}
                  </RadioGroup>
                </div>
              </TabsContent>

              <TabsContent value="options" className="mt-0 space-y-6">
                <div className="space-y-4">
                  <Label className="text-base font-medium">Content Options</Label>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="metadata">Include Metadata</Label>
                        <p className="text-sm text-muted-foreground">
                          Category, type, complexity, tags
                        </p>
                      </div>
                      <Switch
                        id="metadata"
                        checked={options.includeMetadata}
                        onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeMetadata: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="version-info">Include Version Info</Label>
                        <p className="text-sm text-muted-foreground">
                          Version number and creation date
                        </p>
                      </div>
                      <Switch
                        id="version-info"
                        checked={options.includeVersionInfo}
                        onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeVersionInfo: checked }))}
                      />
                    </div>
                  </div>
                </div>

                {selectedFormatConfig?.supportsCustomization && (
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Formatting Options</Label>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="indentation">Indentation</Label>
                        <Select
                          value={String(options.formatting?.indentation || 2)}
                          onValueChange={(value) => setOptions(prev => ({
                            ...prev,
                            formatting: { ...prev.formatting, indentation: parseInt(value) }
                          }))}
                        >
                          <SelectTrigger id="indentation">
                            <SelectValue placeholder="Select indentation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2 spaces</SelectItem>
                            <SelectItem value="4">4 spaces</SelectItem>
                            <SelectItem value="8">8 spaces</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="line-breaks">Extra Line Breaks</Label>
                          <p className="text-sm text-muted-foreground">
                            Add spacing between sections
                          </p>
                        </div>
                        <Switch
                          id="line-breaks"
                          checked={options.formatting?.lineBreaks ?? true}
                          onCheckedChange={(checked) => setOptions(prev => ({
                            ...prev,
                            formatting: { ...prev.formatting, lineBreaks: checked }
                          }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="comments">Include Comments</Label>
                          <p className="text-sm text-muted-foreground">
                            Add explanatory comments
                          </p>
                        </div>
                        <Switch
                          id="comments"
                          checked={options.formatting?.comments ?? true}
                          onCheckedChange={(checked) => setOptions(prev => ({
                            ...prev,
                            formatting: { ...prev.formatting, comments: checked }
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Preview */}
          <div className="overflow-y-auto">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Preview</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleCopyToClipboard}
                        className="h-8 gap-1"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            <span>Copy</span>
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy to clipboard</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="relative bg-muted rounded-lg p-4 h-[calc(90vh-280px)] overflow-auto border">
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {preview}
                </pre>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex-1 text-sm text-muted-foreground">
            {selectedFormatConfig && (
              <span>
                <span className="font-medium">{selectedFormatConfig.name}</span>
                <span className="ml-1">(.{selectedFormatConfig.extension})</span>
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Exporting...' : 'Download'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}