// Test script to verify AI configuration
import { getAIConfig, getCurrentModelDisplayName } from '../src/lib/ai/config.ts';

console.log('Current AI Configuration:');
console.log('========================');

const config = getAIConfig();
console.log(`Provider: ${config.provider}`);
console.log(`Model: ${config.model}`);
console.log(`Display Name: ${getCurrentModelDisplayName()}`);
console.log(`Complexity: ${config.defaultComplexity}`);
console.log(`Max Tokens: ${config.maxTokens}`);

console.log('\n✅ Configuration loaded successfully!');
console.log(`🤖 Using ${getCurrentModelDisplayName()} as the default AI model`);
