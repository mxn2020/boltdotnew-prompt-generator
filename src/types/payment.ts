export interface UserSubscription {
  id: string;
  user_id: string;
  plan_type: 'free' | 'pro' | 'max';
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  stripe_price_id?: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing';
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserCredits {
  id: string;
  user_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  last_refill_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  transaction_type: 'earned' | 'spent' | 'refund' | 'bonus';
  amount: number;
  balance_after: number;
  description: string;
  metadata: Record<string, any>;
  ai_usage_log_id?: string;
  created_at: string;
}

export interface PaymentTransaction {
  id: string;
  user_id: string;
  stripe_payment_intent_id?: string;
  stripe_invoice_id?: string;
  amount: number;
  currency: string;
  status: string;
  description?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface AIUsageLog {
  id: string;
  user_id: string;
  feature_type: string;
  provider: string;
  model: string;
  prompt_length: number;
  base_cost: number;
  multiplier: number;
  total_cost: number;
  prompt_id?: string;
  success: boolean;
  error_message?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface OnboardingProgress {
  id: string;
  user_id: string;
  completed: boolean;
  current_step: number;
  steps_completed: number[];
  onboarding_data: Record<string, any>;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PlanFeatures {
  name: string;
  price: number;
  credits: number;
  features: string[];
  popular?: boolean;
}

export interface AIFeatureConfig {
  feature_type: string;
  base_cost: number;
  multipliers: {
    provider: Record<string, number>;
    model: Record<string, number>;
    complexity: Record<string, number>;
    length: {
      short: number;    // 0-500 chars
      medium: number;   // 501-1500 chars
      long: number;     // 1501+ chars
    };
  };
}

export interface SubscriptionInfo {
  plan_type: 'free' | 'pro' | 'max';
  status: string;
  credits_balance: number;
  current_period_end?: string;
  can_use_ai: boolean;
}

export const PLAN_FEATURES: Record<string, PlanFeatures> = {
  free: {
    name: 'Free',
    price: 0,
    credits: 100,
    features: [
      'Create unlimited prompts',
      'Basic prompt structures',
      'Export to text/markdown',
      'Community access',
      'Version control',
      '100 AI credits to start'
    ]
  },
  pro: {
    name: 'Pro',
    price: 9,
    credits: 1000,
    features: [
      'Everything in Free',
      'AI-powered prompt generation',
      'Advanced prompt structures',
      'All export formats',
      'Priority support',
      '1,000 AI credits/month'
    ],
    popular: true
  },
  max: {
    name: 'Max',
    price: 29,
    credits: 5000,
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Advanced analytics',
      'Custom integrations',
      '5,000 AI credits/month'
    ]
  }
};

export const AI_FEATURE_CONFIGS: Record<string, AIFeatureConfig> = {
  prompt_generation: {
    feature_type: 'prompt_generation',
    base_cost: 10,
    multipliers: {
      provider: {
        openai: 1.0,
        anthropic: 1.2
      },
      model: {
        'gpt-4.1': 10,
        'gpt-4.1-mini': 2,
        'gpt-4.1-nano': 0.5,
        'gpt-4o': 12.5,
        'gpt-4o-mini': 0.75,
        'o3-mini': 5.5,
        'o4-mini': 5.5,
        'o3': 10,
        'o3-deep-research': 50,
        'claude-3-opus-20240229': 2.0,
        'claude-3-sonnet-20240229': 1.2,
        'claude-3-haiku-20240307': 0.8
      },
      complexity: {
        simple: 1.0,
        medium: 1.5,
        complex: 2.0
      },
      length: {
        short: 1.0,
        medium: 1.5,
        long: 2.0
      }
    }
  }
};

export const STRIPE_CONFIG = {
  PRICE_IDS: {
    pro_monthly: import.meta.env.VITE_STRIPE_PRO_MONTHLY_PRICE_ID,
    pro_yearly: import.meta.env.VITE_STRIPE_PRO_YEARLY_PRICE_ID,
    max_monthly: import.meta.env.VITE_STRIPE_MAX_MONTHLY_PRICE_ID,
    max_yearly: import.meta.env.VITE_STRIPE_MAX_YEARLY_PRICE_ID
  }
};