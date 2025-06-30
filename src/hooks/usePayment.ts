import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
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
  const { user } = useAuth();

  return useQuery({
    queryKey: ['subscription-info', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('get_user_subscription_info');

      if (error) throw error;
      return data[0] as SubscriptionInfo;
    },
    enabled: !!user,
  });
}

export function useCreditTransactions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['credit-transactions', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as CreditTransaction[];
    },
    enabled: !!user,
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
  const { user } = useAuth();

  return useQuery({
    queryKey: ['ai-usage-logs', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('ai_usage_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as AIUsageLog[];
    },
    enabled: !!user,
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

  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc('initialize_user_subscription', {
        target_user_id: userId
      });

      if (error) throw error;
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
  return useMutation({
    mutationFn: async ({ userId, requiredCredits }: { userId: string; requiredCredits: number }) => {
      const { data, error } = await supabase.rpc('check_user_credits', {
        target_user_id: userId,
        required_credits: requiredCredits
      });

      if (error) throw error;
      return data as boolean;
    },
  });
}

export function useDeductCredits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      userId: string;
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
      const { data, error } = await supabase.rpc('deduct_credits', {
        target_user_id: params.userId,
        feature_type_param: params.featureType,
        provider_param: params.provider,
        model_param: params.model,
        prompt_length_param: params.promptLength,
        base_cost_param: params.baseCost,
        multiplier_param: params.multiplier,
        total_cost_param: params.totalCost,
        prompt_id_param: params.promptId,
        success_param: params.success ?? true,
        error_message_param: params.errorMessage
      });

      if (error) throw error;
      return data as boolean;
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

  return useMutation({
    mutationFn: async (params: {
      userId: string;
      amount: number;
      transactionType?: string;
      description?: string;
    }) => {
      const { data, error } = await supabase.rpc('add_credits', {
        target_user_id: params.userId,
        amount_param: params.amount,
        transaction_type_param: params.transactionType || 'earned',
        description_param: params.description || 'Credits added'
      });

      if (error) throw error;
      return data as number;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credits'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-info'] });
      queryClient.invalidateQueries({ queryKey: ['credit-transactions'] });
    },
  });
}