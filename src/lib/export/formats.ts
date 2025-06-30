import type { Prompt, PromptContent } from '../../types/prompt';
import type { ExportFormat, ExportOptions, ExportResult } from '../../types/version';

export const EXPORT_FORMATS: ExportFormat[] = [
  {
    id: 'plain-text',
    name: 'Plain Text',
    description: 'Clean, formatted text output',
    extension: 'txt',
    mimeType: 'text/plain',
    supportsCustomization: true,
  },
  {
    id: 'markdown',
    name: 'Markdown',
    description: 'Structured markdown with proper formatting',
    extension: 'md',
    mimeType: 'text/markdown',
    supportsCustomization: true,
  },
  {
    id: 'yaml',
    name: 'YAML',
    description: 'Hierarchical YAML structure for configuration',
    extension: 'yaml',
    mimeType: 'application/x-yaml',
    supportsCustomization: true,
  },
  {
    id: 'html',
    name: 'HTML',
    description: 'Web-ready HTML with styling and structure',
    extension: 'html',
    mimeType: 'text/html',
    supportsCustomization: true,
  },
  {
    id: 'xml',
    name: 'XML',
    description: 'Structured XML format for system integration',
    extension: 'xml',
    mimeType: 'application/xml',
    supportsCustomization: true,
  },
  {
    id: 'json',
    name: 'JSON',
    description: 'Machine-readable JSON structure',
    extension: 'json',
    mimeType: 'application/json',
    supportsCustomization: false,
  },
  {
    id: 'prompty',
    name: 'Prompty',
    description: 'Custom SQL-like format for prompt definition',
    extension: 'prompty',
    mimeType: 'text/plain',
    supportsCustomization: true,
  },
];

export class ExportEngine {
  static async exportPrompt(
    prompt: Prompt,
    options: ExportOptions
  ): Promise<ExportResult> {
    const format = EXPORT_FORMATS.find(f => f.id === options.format);
    if (!format) {
      throw new Error(`Unsupported export format: ${options.format}`);
    }

    let content: string;

    switch (options.format) {
      case 'plain-text':
        content = this.exportAsPlainText(prompt, options);
        break;
      case 'markdown':
        content = this.exportAsMarkdown(prompt, options);
        break;
      case 'yaml':
        content = this.exportAsYAML(prompt, options);
        break;
      case 'html':
        content = this.exportAsHTML(prompt, options);
        break;
      case 'xml':
        content = this.exportAsXML(prompt, options);
        break;
      case 'json':
        content = this.exportAsJSON(prompt, options);
        break;
      case 'prompty':
        content = this.exportAsPrompty(prompt, options);
        break;
      default:
        throw new Error(`Export format not implemented: ${options.format}`);
    }

    const filename = this.generateFilename(prompt, format);
    
    return {
      content,
      filename,
      mimeType: format.mimeType,
      size: new Blob([content]).size,
    };
  }

  private static exportAsPlainText(prompt: Prompt, options: ExportOptions): string {
    let output = '';

    if (options.includeMetadata) {
      output += `Title: ${prompt.title}\n`;
      if (prompt.description) {
        output += `Description: ${prompt.description}\n`;
      }
      output += `Structure: ${prompt.structure_type}\n`;
      output += `Category: ${prompt.category}\n`;
      output += `Complexity: ${prompt.complexity}\n`;
      if (options.includeVersionInfo) {
        output += `Version: ${prompt.version_major}.${prompt.version_minor}.${prompt.version_batch}\n`;
      }
      output += '\n' + '='.repeat(50) + '\n\n';
    }

    output += this.renderContent(prompt.content, 'plain');
    return output;
  }

  private static exportAsMarkdown(prompt: Prompt, options: ExportOptions): string {
    let output = '';

    if (options.includeMetadata) {
      output += `# ${prompt.title}\n\n`;
      if (prompt.description) {
        output += `${prompt.description}\n\n`;
      }
      
      output += '## Metadata\n\n';
      output += `- **Structure**: ${prompt.structure_type}\n`;
      output += `- **Category**: ${prompt.category}\n`;
      output += `- **Type**: ${prompt.type}\n`;
      output += `- **Language**: ${prompt.language}\n`;
      output += `- **Complexity**: ${prompt.complexity}\n`;
      
      if (options.includeVersionInfo) {
        output += `- **Version**: ${prompt.version_major}.${prompt.version_minor}.${prompt.version_batch}\n`;
      }
      
      if (prompt.tags.length > 0) {
        output += `- **Tags**: ${prompt.tags.join(', ')}\n`;
      }
      
      output += '\n## Content\n\n';
    }

    output += this.renderContent(prompt.content, 'markdown');
    return output;
  }

  private static exportAsYAML(prompt: Prompt, options: ExportOptions): string {
    const yamlData: any = {
      prompt: {
        title: prompt.title,
        structure_type: prompt.structure_type,
        content: prompt.content,
      }
    };

    if (options.includeMetadata) {
      yamlData.prompt.metadata = {
        description: prompt.description,
        category: prompt.category,
        type: prompt.type,
        language: prompt.language,
        complexity: prompt.complexity,
        tags: prompt.tags,
      };
    }

    if (options.includeVersionInfo) {
      yamlData.prompt.version = {
        major: prompt.version_major,
        minor: prompt.version_minor,
        batch: prompt.version_batch,
      };
    }

    return this.objectToYAML(yamlData);
  }

  private static exportAsHTML(prompt: Prompt, options: ExportOptions): string {
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${prompt.title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
        .metadata { background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 2rem; }
        .metadata h2 { margin-top: 0; }
        .content { background: white; border: 1px solid #e9ecef; border-radius: 8px; padding: 1.5rem; }
        .segment, .section, .module, .block { margin-bottom: 1.5rem; padding: 1rem; border-left: 4px solid #007bff; background: #f8f9fa; }
        .segment-type, .wrapper { display: inline-block; background: #007bff; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.875rem; margin-bottom: 0.5rem; }
        pre { background: #f8f9fa; padding: 1rem; border-radius: 4px; overflow-x: auto; }
    </style>
</head>
<body>`;

    html += `<h1>${prompt.title}</h1>`;

    if (options.includeMetadata) {
      html += '<div class="metadata">';
      html += '<h2>Metadata</h2>';
      if (prompt.description) {
        html += `<p><strong>Description:</strong> ${prompt.description}</p>`;
      }
      html += `<p><strong>Structure:</strong> ${prompt.structure_type}</p>`;
      html += `<p><strong>Category:</strong> ${prompt.category}</p>`;
      html += `<p><strong>Type:</strong> ${prompt.type}</p>`;
      html += `<p><strong>Language:</strong> ${prompt.language}</p>`;
      html += `<p><strong>Complexity:</strong> ${prompt.complexity}</p>`;
      if (options.includeVersionInfo) {
        html += `<p><strong>Version:</strong> ${prompt.version_major}.${prompt.version_minor}.${prompt.version_batch}</p>`;
      }
      if (prompt.tags.length > 0) {
        html += `<p><strong>Tags:</strong> ${prompt.tags.join(', ')}</p>`;
      }
      html += '</div>';
    }

    html += '<div class="content">';
    html += this.renderContent(prompt.content, 'html');
    html += '</div>';

    html += '</body></html>';
    return html;
  }

  private static exportAsXML(prompt: Prompt, options: ExportOptions): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<prompt>\n';

    if (options.includeMetadata) {
      xml += '  <metadata>\n';
      xml += `    <title><![CDATA[${prompt.title}]]></title>\n`;
      if (prompt.description) {
        xml += `    <description><![CDATA[${prompt.description}]]></description>\n`;
      }
      xml += `    <structure_type>${prompt.structure_type}</structure_type>\n`;
      xml += `    <category>${prompt.category}</category>\n`;
      xml += `    <type>${prompt.type}</type>\n`;
      xml += `    <language>${prompt.language}</language>\n`;
      xml += `    <complexity>${prompt.complexity}</complexity>\n`;
      
      if (options.includeVersionInfo) {
        xml += '    <version>\n';
        xml += `      <major>${prompt.version_major}</major>\n`;
        xml += `      <minor>${prompt.version_minor}</minor>\n`;
        xml += `      <batch>${prompt.version_batch}</batch>\n`;
        xml += '    </version>\n';
      }
      
      if (prompt.tags.length > 0) {
        xml += '    <tags>\n';
        prompt.tags.forEach(tag => {
          xml += `      <tag>${tag}</tag>\n`;
        });
        xml += '    </tags>\n';
      }
      xml += '  </metadata>\n';
    }

    xml += '  <content>\n';
    xml += this.renderContentAsXML(prompt.content);
    xml += '  </content>\n';
    xml += '</prompt>';

    return xml;
  }

  private static exportAsJSON(prompt: Prompt, options: ExportOptions): string {
    const jsonData: any = {
      title: prompt.title,
      structure_type: prompt.structure_type,
      content: prompt.content,
    };

    if (options.includeMetadata) {
      jsonData.metadata = {
        description: prompt.description,
        category: prompt.category,
        type: prompt.type,
        language: prompt.language,
        complexity: prompt.complexity,
        tags: prompt.tags,
      };
    }

    if (options.includeVersionInfo) {
      jsonData.version = {
        major: prompt.version_major,
        minor: prompt.version_minor,
        batch: prompt.version_batch,
      };
    }

    return JSON.stringify(jsonData, null, options.formatting?.indentation || 2);
  }

  private static exportAsPrompty(prompt: Prompt, options: ExportOptions): string {
    let prompty = `PROMPT "${prompt.title}" VERSION ${prompt.version_major}.${prompt.version_minor}.${prompt.version_batch} {\n`;

    if (options.includeMetadata) {
      prompty += '    METADATA {\n';
      if (prompt.description) {
        prompty += `        description: "${prompt.description}",\n`;
      }
      prompty += `        category: "${prompt.category}",\n`;
      prompty += `        type: "${prompt.type}",\n`;
      prompty += `        language: "${prompt.language}",\n`;
      prompty += `        complexity: "${prompt.complexity}"\n`;
      prompty += '    }\n\n';
    }

    prompty += this.renderContentAsPrompty(prompt.content);
    prompty += '}';

    return prompty;
  }

  private static renderContent(content: PromptContent, format: 'plain' | 'markdown' | 'html'): string {
    let output = '';

    if (content.segments) {
      content.segments.forEach((segment, index) => {
        if (format === 'markdown') {
          output += `### ${segment.type.charAt(0).toUpperCase() + segment.type.slice(1)} Segment\n\n`;
          output += `${segment.content}\n\n`;
        } else if (format === 'html') {
          output += `<div class="segment">`;
          output += `<span class="segment-type">${segment.type}</span>`;
          output += `<pre>${segment.content}</pre>`;
          output += `</div>`;
        } else {
          output += `[${segment.type.toUpperCase()}]\n${segment.content}\n\n`;
        }
      });
    }

    if (content.sections) {
      content.sections.forEach((section, index) => {
        if (format === 'markdown') {
          output += `## ${section.title}\n\n`;
          if (section.description) {
            output += `${section.description}\n\n`;
          }
          output += `${section.content}\n\n`;
        } else if (format === 'html') {
          output += `<div class="section">`;
          output += `<h3>${section.title}</h3>`;
          if (section.description) {
            output += `<p><em>${section.description}</em></p>`;
          }
          output += `<pre>${section.content}</pre>`;
          output += `</div>`;
        } else {
          output += `## ${section.title}\n`;
          if (section.description) {
            output += `${section.description}\n`;
          }
          output += `${section.content}\n\n`;
        }
      });
    }

    if (content.modules) {
      content.modules.forEach((module, index) => {
        if (format === 'markdown') {
          output += `### Module: ${module.title}\n\n`;
          if (module.description) {
            output += `${module.description}\n\n`;
          }
          if (module.wrappers && module.wrappers.length > 0) {
            output += `**Wrappers**: ${module.wrappers.join(', ')}\n\n`;
          }
          output += `${module.content}\n\n`;
        } else if (format === 'html') {
          output += `<div class="module">`;
          output += `<h3>${module.title}</h3>`;
          if (module.description) {
            output += `<p><em>${module.description}</em></p>`;
          }
          if (module.wrappers && module.wrappers.length > 0) {
            output += `<span class="wrapper">Wrappers: ${module.wrappers.join(', ')}</span>`;
          }
          output += `<pre>${module.content}</pre>`;
          output += `</div>`;
        } else {
          output += `MODULE: ${module.title}\n`;
          if (module.description) {
            output += `${module.description}\n`;
          }
          if (module.wrappers && module.wrappers.length > 0) {
            output += `Wrappers: ${module.wrappers.join(', ')}\n`;
          }
          output += `${module.content}\n\n`;
        }
      });
    }

    if (content.blocks) {
      content.blocks.forEach((block, index) => {
        if (format === 'markdown') {
          output += `## Block: ${block.title}\n\n`;
          if (block.description) {
            output += `${block.description}\n\n`;
          }
          block.modules.forEach((module) => {
            output += `### ${module.title}\n\n`;
            output += `${module.content}\n\n`;
          });
        } else if (format === 'html') {
          output += `<div class="block">`;
          output += `<h2>${block.title}</h2>`;
          if (block.description) {
            output += `<p><em>${block.description}</em></p>`;
          }
          block.modules.forEach((module) => {
            output += `<div class="module">`;
            output += `<h3>${module.title}</h3>`;
            output += `<pre>${module.content}</pre>`;
            output += `</div>`;
          });
          output += `</div>`;
        } else {
          output += `BLOCK: ${block.title}\n`;
          if (block.description) {
            output += `${block.description}\n`;
          }
          block.modules.forEach((module) => {
            output += `  MODULE: ${module.title}\n`;
            output += `  ${module.content.replace(/\n/g, '\n  ')}\n\n`;
          });
        }
      });
    }

    return output;
  }

  private static renderContentAsXML(content: PromptContent): string {
    let xml = '';

    if (content.segments) {
      content.segments.forEach((segment) => {
        xml += `    <segment type="${segment.type}">\n`;
        xml += `      <content><![CDATA[${segment.content}]]></content>\n`;
        xml += `    </segment>\n`;
      });
    }

    if (content.sections) {
      content.sections.forEach((section) => {
        xml += `    <section>\n`;
        xml += `      <title><![CDATA[${section.title}]]></title>\n`;
        if (section.description) {
          xml += `      <description><![CDATA[${section.description}]]></description>\n`;
        }
        xml += `      <content><![CDATA[${section.content}]]></content>\n`;
        xml += `    </section>\n`;
      });
    }

    if (content.modules) {
      content.modules.forEach((module) => {
        xml += `    <module>\n`;
        xml += `      <title><![CDATA[${module.title}]]></title>\n`;
        if (module.description) {
          xml += `      <description><![CDATA[${module.description}]]></description>\n`;
        }
        if (module.wrappers && module.wrappers.length > 0) {
          xml += `      <wrappers>\n`;
          module.wrappers.forEach(wrapper => {
            xml += `        <wrapper>${wrapper}</wrapper>\n`;
          });
          xml += `      </wrappers>\n`;
        }
        xml += `      <content><![CDATA[${module.content}]]></content>\n`;
        xml += `    </module>\n`;
      });
    }

    if (content.blocks) {
      content.blocks.forEach((block) => {
        xml += `    <block>\n`;
        xml += `      <title><![CDATA[${block.title}]]></title>\n`;
        if (block.description) {
          xml += `      <description><![CDATA[${block.description}]]></description>\n`;
        }
        xml += `      <modules>\n`;
        block.modules.forEach((module) => {
          xml += `        <module>\n`;
          xml += `          <title><![CDATA[${module.title}]]></title>\n`;
          xml += `          <content><![CDATA[${module.content}]]></content>\n`;
          xml += `        </module>\n`;
        });
        xml += `      </modules>\n`;
        xml += `    </block>\n`;
      });
    }

    return xml;
  }

  private static renderContentAsPrompty(content: PromptContent): string {
    let prompty = '';

    if (content.segments) {
      content.segments.forEach((segment) => {
        prompty += `    SEGMENT ${segment.type} {\n`;
        prompty += `        content: "${segment.content.replace(/"/g, '\\"')}"\n`;
        prompty += `    }\n\n`;
      });
    }

    if (content.sections) {
      content.sections.forEach((section) => {
        prompty += `    SECTION "${section.title}" {\n`;
        if (section.description) {
          prompty += `        description: "${section.description.replace(/"/g, '\\"')}",\n`;
        }
        prompty += `        content: "${section.content.replace(/"/g, '\\"')}"\n`;
        prompty += `    }\n\n`;
      });
    }

    if (content.modules) {
      content.modules.forEach((module) => {
        prompty += `    MODULE "${module.title}"`;
        if (module.wrappers && module.wrappers.length > 0) {
          prompty += ` WRAPPERS ${module.wrappers.join(', ')}`;
        }
        prompty += ` {\n`;
        if (module.description) {
          prompty += `        description: "${module.description.replace(/"/g, '\\"')}",\n`;
        }
        prompty += `        content: "${module.content.replace(/"/g, '\\"')}"\n`;
        prompty += `    }\n\n`;
      });
    }

    if (content.blocks) {
      content.blocks.forEach((block) => {
        prompty += `    BLOCK "${block.title}" {\n`;
        if (block.description) {
          prompty += `        description: "${block.description.replace(/"/g, '\\"')}",\n`;
        }
        block.modules.forEach((module) => {
          prompty += `        MODULE "${module.title}" {\n`;
          prompty += `            content: "${module.content.replace(/"/g, '\\"')}"\n`;
          prompty += `        }\n`;
        });
        prompty += `    }\n\n`;
      });
    }

    return prompty;
  }

  private static objectToYAML(obj: any, indent = 0): string {
    const spaces = '  '.repeat(indent);
    let yaml = '';

    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) {
        yaml += `${spaces}${key}: null\n`;
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        yaml += this.objectToYAML(value, indent + 1);
      } else if (Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        value.forEach((item) => {
          if (typeof item === 'object') {
            yaml += `${spaces}  -\n`;
            yaml += this.objectToYAML(item, indent + 2);
          } else {
            yaml += `${spaces}  - ${item}\n`;
          }
        });
      } else if (typeof value === 'string') {
        yaml += `${spaces}${key}: "${value}"\n`;
      } else {
        yaml += `${spaces}${key}: ${value}\n`;
      }
    }

    return yaml;
  }

  private static generateFilename(prompt: Prompt, format: ExportFormat): string {
    const sanitizedTitle = prompt.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    const version = `v${prompt.version_major}-${prompt.version_minor}-${prompt.version_batch}`;
    return `${sanitizedTitle}-${version}.${format.extension}`;
  }
}