import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { createStripeCheckoutSession, createStripePortalSession, getPriceIdForPlan } from '../lib/stripe-checkout';
import type { 
  UserSubscription, 
  UserCredits, 
  CreditTransaction,
  PaymentTransaction,
  OnboardingProgress,
  SubscriptionInfo,
  AIUsageLog
} from '../types/payment';

export function useSubscription() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as UserSubscription | null;
    },
    enabled: !!user,
  });
}

export function useCredits() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['credits', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as UserCredits | null;
    },
    enabled: !!user,
  });
}

export function useSubscriptionInfo() {
  const { user, session } = useAuth();

  return useQuery({
    queryKey: ['subscription-info', user?.id],
    queryFn: async () => {
      if (!user || !session) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('manage-credits', {
        body: { action: 'get_subscription_info' },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      return data.subscription as SubscriptionInfo;
    },
    enabled: !!user && !!session,
  });
}

export function useCreditTransactions() {
  const { user, session } = useAuth();

  return useQuery({
    queryKey: ['credit-transactions', user?.id],
    queryFn: async () => {
      if (!user || !session) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('manage-credits', {
        body: { 
          action: 'get_credit_history',
          limit: 50,
          offset: 0
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      return data.transactions as CreditTransaction[];
    },
    enabled: !!user && !!session,
  });
}

export function usePaymentTransactions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['payment-transactions', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as PaymentTransaction[];
    },
    enabled: !!user,
  });
}

export function useAIUsageLogs() {
  const { user, session } = useAuth();

  return useQuery({
    queryKey: ['ai-usage-logs', user?.id],
    queryFn: async () => {
      if (!user || !session) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('manage-credits', {
        body: { 
          action: 'get_usage_stats',
          days: 30
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      return data.usage_logs as AIUsageLog[];
    },
    enabled: !!user && !!session,
  });
}

export function useOnboardingProgress() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['onboarding-progress', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as OnboardingProgress | null;
    },
    enabled: !!user,
  });
}

export function useInitializeUserSubscription() {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!session) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('initialize-user', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['credits'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-info'] });
      queryClient.invalidateQueries({ queryKey: ['onboarding-progress'] });
    },
  });
}

export function useUpdateOnboardingProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ step, data }: { step: number; data?: Record<string, any> }) => {
      const { data: result, error } = await supabase.rpc('update_onboarding_progress', {
        step_number: step,
        step_data: data || {}
      });

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-progress'] });
    },
  });
}

export function useCheckCredits() {
  const { session } = useAuth();

  return useMutation({
    mutationFn: async ({ requiredCredits }: { requiredCredits: number }) => {
      if (!session) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('manage-credits', {
        body: { 
          action: 'check_credits', 
          required_credits: requiredCredits 
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      return data.has_sufficient_credits as boolean;
    },
  });
}

export function useDeductCredits() {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      featureType: string;
      provider: string;
      model: string;
      promptLength: number;
      baseCost: number;
      multiplier: number;
      totalCost: number;
      promptId?: string;
      success?: boolean;
      errorMessage?: string;
    }) => {
      if (!session) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('manage-credits', {
        body: {
          action: 'deduct_credits',
          feature_type: params.featureType,
          provider: params.provider,
          model: params.model,
          prompt_length: params.promptLength,
          base_cost: params.baseCost,
          multiplier: params.multiplier,
          total_cost: params.totalCost,
          prompt_id: params.promptId,
          success: params.success ?? true,
          error_message: params.errorMessage
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      return data.success as boolean;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credits'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-info'] });
      queryClient.invalidateQueries({ queryKey: ['credit-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['ai-usage-logs'] });
    },
  });
}

export function useAddCredits() {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      amount: number;
      transactionType?: string;
      description?: string;
    }) => {
      if (!session) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('manage-credits', {
        body: {
          action: 'add_credits',
          amount: params.amount,
          transaction_type: params.transactionType || 'earned',
          description: params.description || 'Credits added'
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      return data.new_balance as number;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credits'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-info'] });
      queryClient.invalidateQueries({ queryKey: ['credit-transactions'] });
    },
  });
}

export function useCreateCheckoutSession() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ planType, billingCycle }: { planType: 'pro' | 'max'; billingCycle: 'monthly' | 'yearly' }) => {
      if (!user) throw new Error('User not authenticated');
      
      const priceId = getPriceIdForPlan(planType, billingCycle);
      
      // Get existing customer ID if available
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .single();

      await createStripeCheckoutSession({
        priceId,
        customerId: subscription?.stripe_customer_id
      });
    },
    onSuccess: () => {
      // Invalidate subscription queries when checkout is successful
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-info'] });
    },
  });
}

export function useCreatePortalSession() {
  return useMutation({
    mutationFn: createStripePortalSession,
  });
}