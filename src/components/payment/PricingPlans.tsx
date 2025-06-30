import React from 'react';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import { PLAN_FEATURES } from '../../types/payment';
import { cn } from '../../lib/utils';
import { useCreateCheckoutSession } from '../../hooks/usePayment';

interface PricingPlansProps {
  selectedPlan?: string;
  onSelectPlan?: (plan: string) => void;
  showOnboarding?: boolean;
}

export function PricingPlans({ selectedPlan, onSelectPlan, showOnboarding = false }: PricingPlansProps) {
  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'yearly'>('monthly');
  const createCheckoutSession = useCreateCheckoutSession();

  const handleSelectPlan = (planId: string) => {
    if (onSelectPlan) {
      onSelectPlan(planId);
    } else if (planId !== 'free') {
      // Handle Stripe checkout
      createCheckoutSession.mutate({
        planType: planId as 'pro' | 'max',
        billingCycle
      });
    }
  };

  const getPrice = (basePrice: number) => {
    if (billingCycle === 'yearly') {
      return Math.round(basePrice * 0.8); // 20% discount for yearly
    }
    return basePrice;
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <Sparkles className="w-6 h-6" />;
      case 'pro':
        return <Zap className="w-6 h-6" />;
      case 'max':
        return <Crown className="w-6 h-6" />;
      default:
        return <Sparkles className="w-6 h-6" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {!showOnboarding && (
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Choose the perfect plan for your needs
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Start free and upgrade as you grow. All plans include our core features.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                billingCycle === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors relative',
                billingCycle === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                20% off
              </span>
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Object.entries(PLAN_FEATURES).map(([planId, plan]) => {
          const isSelected = selectedPlan === planId;
          const price = getPrice(plan.price);
          
          return (
            <div
              key={planId}
              className={cn(
                'relative bg-white rounded-2xl border-2 p-8 transition-all',
                plan.popular && 'border-indigo-500 shadow-lg scale-105',
                isSelected && 'border-indigo-500 bg-indigo-50',
                !plan.popular && !isSelected && 'border-gray-200 hover:border-gray-300'
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <div className={cn(
                  'w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4',
                  planId === 'free' && 'bg-gray-100 text-gray-600',
                  planId === 'pro' && 'bg-indigo-100 text-indigo-600',
                  planId === 'max' && 'bg-purple-100 text-purple-600'
                )}>
                  {getPlanIcon(planId)}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">${price}</span>
                  {price > 0 && (
                    <span className="text-gray-600">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                  )}
                </div>

                {plan.credits > 0 && (
                  <div className="text-sm text-gray-600">
                    {billingCycle === 'yearly' ? plan.credits * 12 : plan.credits} AI credits
                    {billingCycle === 'yearly' && '/year'}
                    {billingCycle === 'monthly' && '/month'}
                  </div>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(planId)}
                className={cn(
                  'w-full py-3 px-4 rounded-lg font-medium transition-colors',
                  plan.popular || isSelected
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                )}
              >
                {showOnboarding ? 'Select Plan' : 
                 planId === 'free' ? 'Get Started Free' : 
                 `Start ${plan.name} Plan`}
              </button>

              {planId !== 'free' && !showOnboarding && (
                <p className="text-xs text-gray-500 text-center mt-3">
                  {billingCycle === 'yearly' ? 'Billed annually' : 'Billed monthly'} • Cancel anytime
                </p>
              )}
            </div>
          );
        })}
      </div>

      {!showOnboarding && (
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            All plans include our core prompt engineering features. Upgrade for AI generation and advanced tools.
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>30-day money-back guarantee</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}