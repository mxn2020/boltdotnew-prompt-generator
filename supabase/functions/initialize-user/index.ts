import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

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
    console.log('Initializing user...');

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

    // Call the database function to initialize user subscription and credits
    const { error: initError } = await supabase
      .rpc('initialize_user_subscription', { target_user_id: user.id });

    if (initError) {
      console.error('Initialization error:', initError);
      throw new Error(`Failed to initialize user: ${initError.message}`);
    }

    // Get the initialized user subscription info
    const { data: subscriptionInfo, error: infoError } = await supabase
      .rpc('get_user_subscription_info', { target_user_id: user.id });

    if (infoError) {
      console.error('Failed to get subscription info:', infoError);
      throw new Error(`Failed to get subscription info: ${infoError.message}`);
    }

    console.log('User initialized successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        subscription: subscriptionInfo?.[0] || null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Initialization error:', error);
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