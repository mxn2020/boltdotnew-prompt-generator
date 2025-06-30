import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  User, 
  CreditCard, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  ArrowLeft,
  X
} from 'lucide-react';
import { useOnboardingProgress, useUpdateOnboardingProgress } from '../../hooks/usePayment';
import { useAuth } from '../../contexts/AuthContext';
import { PricingPlans } from '../payment/PricingPlans';
import { cn } from '../../lib/utils';

interface OnboardingFlowProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: progress } = useOnboardingProgress();
  const updateProgress = useUpdateOnboardingProgress();

  const [currentStep, setCurrentStep] = React.useState(progress?.current_step || 1);
  const [formData, setFormData] = React.useState({
    role: '',
    experience: '',
    goals: [] as string[],
    interests: [] as string[],
    plan: 'free'
  });

  const steps = [
    { id: 1, title: 'Welcome', icon: Sparkles },
    { id: 2, title: 'About You', icon: User },
    { id: 3, title: 'Your Goals', icon: Zap },
    { id: 4, title: 'Choose Plan', icon: CreditCard },
    { id: 5, title: 'Complete', icon: CheckCircle },
  ];

  const handleNext = async () => {
    try {
      await updateProgress.mutateAsync({ 
        step: currentStep, 
        data: formData 
      });
      
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
      } else {
        onComplete();
      }
    } catch (error) {
      console.error('Failed to update onboarding progress:', error);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep />;
      case 2:
        return <AboutYouStep formData={formData} setFormData={setFormData} />;
      case 3:
        return <GoalsStep formData={formData} setFormData={setFormData} />;
      case 4:
        return <PlanStep formData={formData} setFormData={setFormData} />;
      case 5:
        return <CompleteStep formData={formData} />;
      default:
        return <WelcomeStep />;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return true;
      case 2:
        return formData.role && formData.experience;
      case 3:
        return formData.goals.length > 0;
      case 4:
        return formData.plan;
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome to PromptCraft</h1>
              <p className="text-gray-600">Let's get you set up in just a few steps</p>
            </div>
            {onSkip && (
              <button
                onClick={handleSkip}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              {steps.map((step) => {
                const Icon = step.icon;
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;
                
                return (
                  <div
                    key={step.id}
                    className={cn(
                      'flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors',
                      isActive && 'bg-indigo-50 text-indigo-700',
                      isCompleted && 'bg-green-50 text-green-700',
                      !isActive && !isCompleted && 'text-gray-400'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:block">{step.title}</span>
                  </div>
                );
              })}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[400px]">
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-3">
            {onSkip && currentStep < 5 && (
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Skip for now
              </button>
            )}
            
            <button
              onClick={handleNext}
              disabled={!canProceed() || updateProgress.isPending}
              className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>
                {currentStep === 5 ? 'Get Started' : 'Continue'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WelcomeStep() {
  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <Sparkles className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        Welcome to the Future of Prompt Engineering
      </h2>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
        PromptCraft is a professional platform for creating, managing, and optimizing AI prompts. 
        Whether you're a developer, content creator, or AI enthusiast, we'll help you build better prompts faster.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Zap className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">AI-Powered Generation</h3>
          <p className="text-sm text-gray-600">Create optimized prompts with AI assistance</p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <User className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Professional Tools</h3>
          <p className="text-sm text-gray-600">Advanced editing and version control</p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Team Collaboration</h3>
          <p className="text-sm text-gray-600">Share and collaborate on prompts</p>
        </div>
      </div>
    </div>
  );
}

interface StepProps {
  formData: any;
  setFormData: (data: any) => void;
}

function AboutYouStep({ formData, setFormData }: StepProps) {
  const roles = [
    'Developer',
    'Content Creator',
    'Researcher',
    'Product Manager',
    'Marketing Professional',
    'Student',
    'Other'
  ];

  const experiences = [
    'New to AI',
    'Some experience',
    'Experienced user',
    'AI Expert'
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Tell us about yourself</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What's your primary role?
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => setFormData({ ...formData, role })}
                className={cn(
                  'p-3 rounded-lg border text-center transition-colors',
                  formData.role === role
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How would you describe your AI experience?
          </label>
          <div className="space-y-2">
            {experiences.map((experience) => (
              <label key={experience} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="experience"
                  value={experience}
                  checked={formData.experience === experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-gray-900">{experience}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function GoalsStep({ formData, setFormData }: StepProps) {
  const goals = [
    'Generate better AI prompts',
    'Organize prompt libraries',
    'Collaborate with team',
    'Version control prompts',
    'Export prompts for production',
    'Learn prompt engineering',
    'Build AI applications',
    'Content creation'
  ];

  const interests = [
    'Web Development',
    'Content Writing',
    'Data Analysis',
    'Creative Writing',
    'Business Automation',
    'Research',
    'Education',
    'Marketing'
  ];

  const toggleGoal = (goal: string) => {
    const newGoals = formData.goals.includes(goal)
      ? formData.goals.filter((g: string) => g !== goal)
      : [...formData.goals, goal];
    setFormData({ ...formData, goals: newGoals });
  };

  const toggleInterest = (interest: string) => {
    const newInterests = formData.interests.includes(interest)
      ? formData.interests.filter((i: string) => i !== interest)
      : [...formData.interests, interest];
    setFormData({ ...formData, interests: newInterests });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">What are your goals?</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What do you want to achieve with PromptCraft? (Select all that apply)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {goals.map((goal) => (
              <button
                key={goal}
                onClick={() => toggleGoal(goal)}
                className={cn(
                  'p-3 rounded-lg border text-left transition-colors',
                  formData.goals.includes(goal)
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What areas interest you most? (Optional)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {interests.map((interest) => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={cn(
                  'p-3 rounded-lg border text-center transition-colors',
                  formData.interests.includes(interest)
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanStep({ formData, setFormData }: StepProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Choose your plan</h2>
      <PricingPlans
        selectedPlan={formData.plan}
        onSelectPlan={(plan) => setFormData({ ...formData, plan })}
        showOnboarding={true}
      />
    </div>
  );
}

function CompleteStep({ formData }: { formData: any }) {
  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        You're all set!
      </h2>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
        Welcome to PromptCraft! Based on your preferences, we've customized your experience. 
        You can always change your settings later.
      </p>
      
      <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
        <h3 className="font-semibold text-gray-900 mb-4">Your Setup Summary</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div><strong>Role:</strong> {formData.role}</div>
          <div><strong>Experience:</strong> {formData.experience}</div>
          <div><strong>Plan:</strong> {formData.plan}</div>
          <div><strong>Goals:</strong> {formData.goals.length} selected</div>
        </div>
      </div>
    </div>
  );
}