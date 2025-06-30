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
    console.log('Processing checkout request...');
    
    const { priceId, successUrl, cancelUrl, customerId } = await req.json();
    
    // Validate required fields
    if (!priceId || !successUrl || !cancelUrl) {
      throw new Error('Missing required fields: priceId, successUrl, cancelUrl');
    }

    console.log('Request data:', { priceId, successUrl, cancelUrl, customerId });

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

    // Create or get Stripe customer
    let customer;
    if (customerId) {
      console.log('Retrieving existing customer:', customerId);
      customer = await stripe.customers.retrieve(customerId);
    } else {
      console.log('Creating new customer for user:', user.email);
      customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });

      console.log('Created customer:', customer.id);

      // Save customer ID to database
      const { error: upsertError } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          stripe_customer_id: customer.id,
          plan_type: 'free',
          status: 'active',
          cancel_at_period_end: false,
        }, {
          onConflict: 'user_id'
        });

      if (upsertError) {
        console.error('Database upsert error:', upsertError);
        throw new Error(`Database error: ${upsertError.message}`);
      }
    }

    console.log('Creating checkout session...');

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        supabase_user_id: user.id,
      },
    });

    console.log('Checkout session created:', session.id);

    return new Response(
      JSON.stringify({ sessionId: session.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Checkout error:', error);
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