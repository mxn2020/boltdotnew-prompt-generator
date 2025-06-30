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
    // Call your Supabase edge function to create checkout session
    const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
      body: {
        priceId,
        successUrl,
        cancelUrl,
        customerId
      }
    });

    if (error) throw error;

    const stripe = await stripePromise;
    if (!stripe) throw new Error('Stripe failed to load');

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
    const { data, error } = await supabase.functions.invoke('create-stripe-portal', {
      body: {}
    });

    if (error) throw error;

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
