import { stripePromise, STRIPE_PRICE_IDS, type PlanId } from './stripe';
import { supabase } from './supabase';

export interface CreateCheckoutSessionParams {
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
  customerId?: string;
}

export async function createStripeCheckoutSession({
  priceId,
  successUrl = `${window.location.origin}/settings?success=true`,
  cancelUrl = `${window.location.origin}/settings?canceled=true`,
  customerId
}: CreateCheckoutSessionParams) {
  try {
    // Get the current session to ensure user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('User not authenticated. Please log in and try again.');
    }

    console.log('Creating checkout session for user:', session.user.email);

    // Call your Supabase edge function to create checkout session
    const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
      body: {
        priceId,
        successUrl,
        cancelUrl,
        customerId
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error('Edge function error:', error);
      throw error;
    }

    if (!data?.sessionId) {
      throw new Error('No session ID returned from checkout creation');
    }

    const stripe = await stripePromise;
    if (!stripe) throw new Error('Stripe failed to load');

    console.log('Redirecting to Stripe checkout:', data.sessionId);

    // Redirect to Stripe checkout
    const { error: stripeError } = await stripe.redirectToCheckout({
      sessionId: data.sessionId
    });

    if (stripeError) throw stripeError;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

export async function createStripePortalSession() {
  try {
    // Get the current session to ensure user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('User not authenticated. Please log in and try again.');
    }

    console.log('Creating portal session for user:', session.user.email);

    const { data, error } = await supabase.functions.invoke('create-stripe-portal', {
      body: {},
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error('Portal function error:', error);
      throw error;
    }

    if (!data?.url) {
      throw new Error('No portal URL returned');
    }

    console.log('Redirecting to Stripe portal:', data.url);

    // Redirect to customer portal
    window.location.href = data.url;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
}

export function getPriceIdForPlan(planType: 'pro' | 'max', billingCycle: 'monthly' | 'yearly'): string {
  const planKey = `${planType}_${billingCycle}` as PlanId;
  return STRIPE_PRICE_IDS[planKey];
}