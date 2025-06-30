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

    const { action, ...params } = await req.json();

    console.log('Processing credit action:', action, 'for user:', user.id);

    switch (action) {
      case 'check_credits': {
        const { required_credits } = params;
        
        const { data: hasCredits, error } = await supabase
          .rpc('check_user_credits', { 
            target_user_id: user.id, 
            required_credits 
          });

        if (error) {
          throw new Error(`Failed to check credits: ${error.message}`);
        }

        return new Response(
          JSON.stringify({ has_sufficient_credits: hasCredits }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

      case 'deduct_credits': {
        const {
          feature_type,
          provider,
          model,
          prompt_length,
          base_cost,
          multiplier,
          total_cost,
          prompt_id,
          success = true,
          error_message
        } = params;

        const { data: deductionSuccess, error } = await supabase
          .rpc('deduct_credits', {
            target_user_id: user.id,
            feature_type_param: feature_type,
            provider_param: provider,
            model_param: model,
            prompt_length_param: prompt_length,
            base_cost_param: base_cost,
            multiplier_param: multiplier,
            total_cost_param: total_cost,
            prompt_id_param: prompt_id,
            success_param: success,
            error_message_param: error_message
          });

        if (error) {
          throw new Error(`Failed to deduct credits: ${error.message}`);
        }

        return new Response(
          JSON.stringify({ success: deductionSuccess }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

      case 'add_credits': {
        const { amount, transaction_type = 'earned', description = 'Credits added' } = params;

        const { data: newBalance, error } = await supabase
          .rpc('add_credits', {
            target_user_id: user.id,
            amount_param: amount,
            transaction_type_param: transaction_type,
            description_param: description
          });

        if (error) {
          throw new Error(`Failed to add credits: ${error.message}`);
        }

        return new Response(
          JSON.stringify({ new_balance: newBalance }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

      case 'get_subscription_info': {
        const { data: subscriptionInfo, error } = await supabase
          .rpc('get_user_subscription_info', { target_user_id: user.id });

        if (error) {
          throw new Error(`Failed to get subscription info: ${error.message}`);
        }

        return new Response(
          JSON.stringify({ subscription: subscriptionInfo?.[0] || null }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

      case 'get_credit_history': {
        const { limit = 50, offset = 0 } = params;

        const { data: transactions, error } = await supabase
          .from('credit_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) {
          throw new Error(`Failed to get credit history: ${error.message}`);
        }

        return new Response(
          JSON.stringify({ transactions }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

      case 'get_usage_stats': {
        const { days = 30 } = params;
        const since = new Date();
        since.setDate(since.getDate() - days);

        const { data: usageStats, error } = await supabase
          .from('ai_usage_logs')
          .select('feature_type, provider, model, total_cost, created_at')
          .eq('user_id', user.id)
          .gte('created_at', since.toISOString())
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(`Failed to get usage stats: ${error.message}`);
        }

        // Calculate summary stats
        const totalCost = usageStats.reduce((sum, log) => sum + log.total_cost, 0);
        const usageByFeature = usageStats.reduce((acc, log) => {
          acc[log.feature_type] = (acc[log.feature_type] || 0) + log.total_cost;
          return acc;
        }, {});

        return new Response(
          JSON.stringify({ 
            usage_logs: usageStats,
            summary: {
              total_cost: totalCost,
              usage_by_feature: usageByFeature,
              period_days: days
            }
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Credit management error:', error);
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