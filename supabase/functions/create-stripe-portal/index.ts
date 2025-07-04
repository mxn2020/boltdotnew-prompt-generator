import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Processing portal request...');

    // Get user from JWT token
    const jwt = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!jwt) {
      throw new Error('No authorization token provided');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('Unauthorized');
    }

    console.log('User authenticated:', user.id);

    // Get user's Stripe customer ID
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    if (!subscription?.stripe_customer_id) {
      console.log('No Stripe customer found for user:', user.id);
      throw new Error('No Stripe customer found. Please create a subscription first.');
    }

    console.log('Found customer:', subscription.stripe_customer_id);

    // Get return URL from request or use default
    const { returnUrl } = await req.json().catch(() => ({}));
    const defaultReturnUrl = `${req.headers.get('origin') || 'http://localhost:3000'}/settings`;
    
    console.log('Creating portal session...');

    // Create customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: returnUrl || defaultReturnUrl,
    });

    console.log('Portal session created:', session.id);

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Portal error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});