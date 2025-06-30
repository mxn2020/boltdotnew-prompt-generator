import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Brain, 
  Users, 
  GitBranch, 
  Download, 
  Sparkles,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Generation',
    description: 'Intelligent prompt creation with Claude and GPT integration for optimized results.'
  },
  {
    icon: GitBranch,
    title: 'Version Control',
    description: 'Semantic versioning with complete history tracking and rollback capabilities.'
  },
  {
    icon: Users,
    title: 'Component Library',
    description: 'Reusable modules and wrappers for efficient prompt development.'
  },
  {
    icon: Download,
    title: 'Multi-Format Export',
    description: 'Export to Markdown, YAML, JSON, HTML, XML, and custom Prompty format.'
  }
];

const architectures = [
  { name: 'Standard', description: 'Simple segments for quick prompt creation' },
  { name: 'Structured', description: 'Hierarchical sections with nested organization' },
  { name: 'Modulized', description: 'Reusable modules with processing wrappers' },
  { name: 'Advanced', description: 'Complex blocks with assets and dependencies' }
];

export function LandingPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-2 bg-indigo-50 px-4 py-2 rounded-full">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-700">AI-Powered Prompt Engineering</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Professional Prompt
              <span className="text-indigo-600"> Engineering</span>
              <br />
              Made Simple
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your AI interactions with structured, reusable, and intelligent prompts. 
              Build complex prompt architectures with version control, component libraries, and AI-powered generation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/features"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                View Features
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need for professional prompt engineering
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From simple prompts to complex AI architectures, our platform provides the tools 
              and intelligence to create, manage, and optimize your AI interactions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Prompt Architectures */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Four Powerful Prompt Architectures
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the right structure for your needs, from simple segments to complex modular systems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {architectures.map((arch, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 hover:border-indigo-200 transition-colors">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-indigo-600">{index + 1}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{arch.name} Prompts</h3>
                </div>
                <p className="text-gray-600">{arch.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to revolutionize your prompt engineering?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of developers and AI engineers building better prompts with PromptCraft.
          </p>
          <Link
            to="/register"
            className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors inline-flex items-center space-x-2"
          >
            <span>Start Building Today</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}