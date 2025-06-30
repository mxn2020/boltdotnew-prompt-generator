import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const signature = req.headers.get('stripe-signature');
  const body = await req.text();

  if (!signature) {
    console.error('No stripe signature found');
    return new Response('No stripe signature', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    console.log('Webhook event received:', event.type);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        console.log('Processing checkout.session.completed');
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (!session.subscription) {
          console.log('No subscription in session, skipping');
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const userId = session.metadata?.supabase_user_id;

        if (!userId) {
          console.error('No supabase_user_id in session metadata');
          break;
        }

        console.log('Updating subscription for user:', userId);

        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({
            stripe_subscription_id: subscription.id,
            stripe_price_id: subscription.items.data[0].price.id,
            status: 'active',
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            plan_type: getPlanTypeFromPriceId(subscription.items.data[0].price.id),
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error('Failed to update subscription:', updateError);
        } else {
          console.log('Subscription updated successfully');
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        console.log('Processing invoice.payment_succeeded');
        const invoice = event.data.object as Stripe.Invoice;
        const userId = invoice.metadata?.supabase_user_id;

        if (!userId) {
          console.log('No supabase_user_id in invoice metadata, skipping transaction record');
          break;
        }

        console.log('Recording payment transaction for user:', userId);

        // Record payment transaction
        const { error: insertError } = await supabase
          .from('payment_transactions')
          .insert({
            user_id: userId,
            stripe_payment_intent_id: invoice.payment_intent as string,
            stripe_invoice_id: invoice.id,
            amount: invoice.amount_paid, // Keep in cents to match your schema
            currency: invoice.currency,
            status: 'succeeded',
            description: invoice.description || 'Subscription payment',
            metadata: invoice.metadata || {},
          });

        if (insertError) {
          console.error('Failed to record payment transaction:', insertError);
        } else {
          console.log('Payment transaction recorded successfully');
        }
        break;
      }

      case 'customer.subscription.updated': {
        console.log('Processing customer.subscription.updated');
        const subscription = event.data.object as Stripe.Subscription;

        console.log('Updating subscription:', subscription.id);

        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            plan_type: getPlanTypeFromPriceId(subscription.items.data[0].price.id),
          })
          .eq('stripe_subscription_id', subscription.id);

        if (updateError) {
          console.error('Failed to update subscription:', updateError);
        } else {
          console.log('Subscription updated successfully');
        }
        break;
      }

      case 'customer.subscription.deleted': {
        console.log('Processing customer.subscription.deleted');
        const subscription = event.data.object as Stripe.Subscription;

        console.log('Canceling subscription:', subscription.id);

        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({
            status: 'canceled',
            plan_type: 'free',
          })
          .eq('stripe_subscription_id', subscription.id);

        if (updateError) {
          console.error('Failed to cancel subscription:', updateError);
        } else {
          console.log('Subscription canceled successfully');
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response('ok', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Webhook processing failed',
        message: error.message,
        timestamp: new Date().toISOString()
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});

function getPlanTypeFromPriceId(priceId: string): 'free' | 'pro' | 'max' {
  // Map your Stripe price IDs to plan types
  const priceMap: Record<string, 'free' | 'pro' | 'max'> = {
    [Deno.env.get('STRIPE_PRO_MONTHLY_PRICE_ID') || '']: 'pro',
    [Deno.env.get('STRIPE_PRO_YEARLY_PRICE_ID') || '']: 'pro',
    [Deno.env.get('STRIPE_MAX_MONTHLY_PRICE_ID') || '']: 'max',
    [Deno.env.get('STRIPE_MAX_YEARLY_PRICE_ID') || '']: 'max',
  };
  
  const planType = priceMap[priceId];
  console.log(`Mapped price ID ${priceId} to plan type: ${planType || 'free'}`);
  
  return planType || 'free';
}