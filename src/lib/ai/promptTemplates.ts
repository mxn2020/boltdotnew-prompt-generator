import type { StructureType, Complexity } from '../../types/prompt';

export interface GenerationConfig {
  userInput: string;
  structureType: StructureType;
  complexity: Complexity;
  category: string;
  type: string;
  language: string;
  fileContext?: string;
}

export function generateSystemPrompt(config: GenerationConfig): string {
  const basePrompt = `You are an expert prompt engineer with deep knowledge of AI systems and prompt optimization. Your task is to generate a professional, effective prompt based on the user's requirements.

IMPORTANT: You must respond with a valid JSON object that matches the specified structure type. Do not include any text before or after the JSON.`;

  const structureInstructions = {
    standard: `Generate a "standard" prompt structure with segments. Return JSON with this exact format:
{
  "structure_type": "standard",
  "segments": [
    {
      "type": "system|user|assistant|context|instruction",
      "content": "segment content here"
    }
  ]
}`,
    structured: `Generate a "structured" prompt with titled sections. Return JSON with this exact format:
{
  "structure_type": "structured", 
  "sections": [
    {
      "title": "section title",
      "description": "optional description",
      "content": "section content here"
    }
  ]
}`,
    modulized: `Generate a "modulized" prompt with reusable modules. Return JSON with this exact format:
{
  "structure_type": "modulized",
  "modules": [
    {
      "title": "module title",
      "description": "module description", 
      "content": "module content here",
      "wrapper_id": "optional wrapper type"
    }
  ]
}`,
    advanced: `Generate an "advanced" prompt with blocks containing modules. Return JSON with this exact format:
{
  "structure_type": "advanced",
  "blocks": [
    {
      "title": "block title",
      "description": "block description",
      "modules": [
        {
          "title": "module title",
          "content": "module content here"
        }
      ]
    }
  ]
}`
  };

  const complexityGuidelines = {
    simple: 'Keep the prompt straightforward and easy to understand. Use 1-3 components with clear, concise content.',
    medium: 'Create a moderately detailed prompt with 3-5 components. Include examples and specific instructions.',
    complex: 'Build a comprehensive, sophisticated prompt with 5+ components. Include detailed instructions, examples, constraints, and edge cases.'
  };

  const categoryContext = {
    ai: 'Focus on AI assistant interactions, conversation flow, and response quality.',
    web: 'Emphasize web development tasks, code generation, and technical documentation.',
    data: 'Concentrate on data analysis, processing, and interpretation tasks.',
    creative: 'Focus on creative writing, content generation, and artistic expression.',
    business: 'Emphasize business processes, decision-making, and professional communication.',
    research: 'Focus on research methodology, analysis, and academic writing.'
  };

  const typeInstructions = {
    assistant: 'Create a conversational assistant prompt that guides helpful responses.',
    analyzer: 'Build an analytical prompt that breaks down and examines information.',
    generator: 'Design a creative generation prompt that produces original content.',
    optimizer: 'Create an optimization prompt that improves and refines input.',
    tool: 'Build a functional tool prompt that performs specific tasks.',
    agent: 'Design an autonomous agent prompt that can take actions and make decisions.'
  };

  return `${basePrompt}

STRUCTURE REQUIREMENTS:
${structureInstructions[config.structureType]}

COMPLEXITY LEVEL: ${config.complexity}
${complexityGuidelines[config.complexity]}

CATEGORY CONTEXT: ${config.category}
${categoryContext[config.category as keyof typeof categoryContext] || 'General purpose prompt design.'}

TYPE FOCUS: ${config.type}
${typeInstructions[config.type as keyof typeof typeInstructions] || 'General purpose functionality.'}

LANGUAGE: ${config.language}
Generate all content in ${config.language}.

USER REQUIREMENTS:
"${config.userInput}"

${config.fileContext ? `ADDITIONAL CONTEXT:
${config.fileContext}` : ''}

Generate a professional, effective prompt that follows the exact JSON structure specified above. Ensure the content is relevant, well-organized, and optimized for the intended use case.`;
}

export function generateUserPrompt(config: GenerationConfig): string {
  return `Please generate a ${config.complexity} ${config.structureType} prompt for ${config.category} use cases with the following requirements:

${config.userInput}

The prompt should be optimized for ${config.type} functionality and written in ${config.language}.`;
}