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
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const signature = req.headers.get('stripe-signature');
  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature!, endpointSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        
        await supabase
          .from('user_subscriptions')
          .update({
            stripe_subscription_id: subscription.id,
            stripe_price_id: subscription.items.data[0].price.id,
            status: 'active',
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            plan_type: getPlanTypeFromPriceId(subscription.items.data[0].price.id),
          })
          .eq('user_id', session.metadata?.supabase_user_id);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        
        // Record payment transaction
        await supabase
          .from('payment_transactions')
          .insert({
            user_id: invoice.metadata?.supabase_user_id,
            stripe_payment_intent_id: invoice.payment_intent as string,
            stripe_invoice_id: invoice.id,
            amount: invoice.amount_paid / 100, // Convert from cents
            currency: invoice.currency,
            status: 'succeeded',
            description: invoice.description || 'Subscription payment',
            metadata: invoice.metadata || {},
          });
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await supabase
          .from('user_subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            plan_type: getPlanTypeFromPriceId(subscription.items.data[0].price.id),
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await supabase
          .from('user_subscriptions')
          .update({
            status: 'canceled',
            plan_type: 'free',
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return new Response('ok', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Webhook processing failed', { status: 500 });
  }
});

function getPlanTypeFromPriceId(priceId: string): 'free' | 'pro' | 'max' {
  // Map your Stripe price IDs to plan types
  const priceMap: Record<string, 'free' | 'pro' | 'max'> = {
    [Deno.env.get('STRIPE_PRO_MONTHLY_PRICE_ID')!]: 'pro',
    [Deno.env.get('STRIPE_PRO_YEARLY_PRICE_ID')!]: 'pro',
    [Deno.env.get('STRIPE_MAX_MONTHLY_PRICE_ID')!]: 'max',
    [Deno.env.get('STRIPE_MAX_YEARLY_PRICE_ID')!]: 'max',
  };
  
  return priceMap[priceId] || 'free';
}
