import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Brain, 
  Users, 
  GitBranch, 
  Download, 
  Sparkles,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { BoltBadge } from '../components/BoltBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/Logo';
import { Layout } from '@/components/layout/Layout';

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
    <Layout showSidebar={false}>
   <div className="bg-background">
     {/* Hero Section */}
     <div className="relative overflow-hidden">
       <div className="container mx-auto px-4 py-16 sm:py-24">
         {/* Bolt.new Badge - Top Right */}
         <div className="absolute top-4 right-4 md:top-8 md:right-8">
           <BoltBadge size="md" variant="auto" />
         </div>
         
         <div className="text-center">
           <div className="flex justify-center mb-6">
             <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2">
               <Sparkles className="w-4 h-4" />
               AI-Powered Prompt Engineering
             </Badge>
           </div>
           
           <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6">
             <div className="flex justify-center items-center gap-4 mb-4">
               <Logo size="xl" className="w-20 h-20" />
             </div>
             Professional Prompt
             <span className="text-primary"> Engineering</span>
             <br className="hidden sm:block" />
             <span className="block sm:inline"> Made Simple</span>
           </h1>
           
           <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
             Transform your AI interactions with structured, reusable, and intelligent prompts. 
             Build complex prompt architectures with version control, component libraries, and AI-powered generation.
           </p>
           
           <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Button asChild size="lg" className="w-full sm:w-auto">
               <Link to="/register" className="flex items-center justify-center gap-2">
                 Get Started Free
                 <ArrowRight className="w-4 h-4" />
               </Link>
             </Button>
             <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
               <Link to="/features">
                 View Features
               </Link>
             </Button>
           </div>
         </div>
       </div>
     </div>

     {/* Features Section */}
     <div className="py-16 sm:py-24 bg-muted/50">
       <div className="container mx-auto px-4">
         <div className="text-center mb-16">
           <h2 className="text-2xl sm:text-3xl font-bold mb-4">
             Everything you need for professional prompt engineering
           </h2>
           <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
             From simple prompts to complex AI architectures, our platform provides the tools 
             and intelligence to create, manage, and optimize your AI interactions.
           </p>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           {features.map((feature, index) => (
             <Card key={index} className="h-full">
               <CardContent className="p-6">
                 <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                   <feature.icon className="w-6 h-6 text-primary" />
                 </div>
                 <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                 <p className="text-muted-foreground text-sm">{feature.description}</p>
               </CardContent>
             </Card>
           ))}
         </div>
       </div>
     </div>

     {/* Prompt Architectures */}
     <div className="py-16 sm:py-24">
       <div className="container mx-auto px-4">
         <div className="text-center mb-16">
           <h2 className="text-2xl sm:text-3xl font-bold mb-4">
             Four Powerful Prompt Architectures
           </h2>
           <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
             Choose the right structure for your needs, from simple segments to complex modular systems.
           </p>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
           {architectures.map((arch, index) => (
             <Card key={index} className="hover:shadow-lg transition-shadow">
               <CardContent className="p-6">
                 <div className="flex items-center gap-3 mb-3">
                   <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                     <span className="text-sm font-bold text-primary">{index + 1}</span>
                   </div>
                   <h3 className="text-lg font-semibold">{arch.name} Prompts</h3>
                 </div>
                 <p className="text-muted-foreground">{arch.description}</p>
               </CardContent>
             </Card>
           ))}
         </div>
       </div>
     </div>

     {/* CTA Section */}
     <div className="bg-primary py-16">
       <div className="container mx-auto px-4 text-center">
         <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground mb-4">
           Ready to revolutionize your prompt engineering?
         </h2>
         <p className="text-lg sm:text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
           Join thousands of developers and AI engineers building better prompts with PromptVerse.
         </p>
         <Button asChild size="lg" variant="secondary">
           <Link to="/register" className="flex items-center justify-center gap-2">
             Start Building Today
             <ArrowRight className="w-4 h-4" />
           </Link>
         </Button>
       </div>
     </div>
   </div>
    </Layout>
 );
}