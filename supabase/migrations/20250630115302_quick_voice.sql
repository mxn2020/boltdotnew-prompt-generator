/*
  # Payment System and Credits Implementation

  1. New Tables
    - `user_subscriptions` - User subscription plans and status
    - `user_credits` - Credits balance and transaction history
    - `payment_transactions` - Stripe payment records
    - `ai_usage_logs` - Track AI feature usage and costs
    - `onboarding_progress` - Track user onboarding completion

  2. Security
    - Enable RLS on all tables
    - Add policies for user data access

  3. Functions
    - Credit management functions
    - Usage tracking functions
    - Subscription management
*/

-- User subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  plan_type text NOT NULL CHECK (plan_type IN ('free', 'pro', 'max')) DEFAULT 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text,
  status text NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing')) DEFAULT 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscription"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON user_subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON user_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- User credits table
CREATE TABLE IF NOT EXISTS user_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  balance integer NOT NULL DEFAULT 0,
  total_earned integer DEFAULT 0,
  total_spent integer DEFAULT 0,
  last_refill_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own credits"
  ON user_credits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage credits"
  ON user_credits
  FOR ALL
  TO authenticated
  USING (true);

-- Credit transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'refund', 'bonus')),
  amount integer NOT NULL,
  balance_after integer NOT NULL,
  description text NOT NULL,
  metadata jsonb DEFAULT '{}',
  ai_usage_log_id uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own credit transactions"
  ON credit_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert credit transactions"
  ON credit_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Payment transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_payment_intent_id text UNIQUE,
  stripe_invoice_id text,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own payment transactions"
  ON payment_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage payment transactions"
  ON payment_transactions
  FOR ALL
  TO authenticated
  USING (true);

-- AI usage logs table
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  feature_type text NOT NULL,
  provider text NOT NULL,
  model text NOT NULL,
  prompt_length integer NOT NULL,
  base_cost integer NOT NULL,
  multiplier numeric NOT NULL,
  total_cost integer NOT NULL,
  prompt_id uuid REFERENCES prompts(id) ON DELETE SET NULL,
  success boolean DEFAULT true,
  error_message text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own AI usage logs"
  ON ai_usage_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert AI usage logs"
  ON ai_usage_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Onboarding progress table
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  completed boolean DEFAULT false,
  current_step integer DEFAULT 1,
  steps_completed jsonb DEFAULT '[]',
  onboarding_data jsonb DEFAULT '{}',
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own onboarding progress"
  ON onboarding_progress
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer ON user_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_stripe_intent ON payment_transactions(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_id ON ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created_at ON ai_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_user_id ON onboarding_progress(user_id);

-- Update triggers
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON user_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_progress_updated_at
  BEFORE UPDATE ON onboarding_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to initialize user subscription and credits
CREATE OR REPLACE FUNCTION initialize_user_subscription(target_user_id uuid)
RETURNS void AS $$
BEGIN
  -- Create free subscription
  INSERT INTO user_subscriptions (user_id, plan_type, status)
  VALUES (target_user_id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create credits record with 100 starting credits for free plan
  INSERT INTO user_credits (user_id, balance)
  VALUES (target_user_id, 100)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create onboarding progress
  INSERT INTO onboarding_progress (user_id)
  VALUES (target_user_id)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has sufficient credits
CREATE OR REPLACE FUNCTION check_user_credits(target_user_id uuid, required_credits integer)
RETURNS boolean AS $$
DECLARE
  current_balance integer;
BEGIN
  SELECT balance INTO current_balance
  FROM user_credits
  WHERE user_id = target_user_id;
  
  RETURN COALESCE(current_balance, 0) >= required_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deduct credits and log usage
CREATE OR REPLACE FUNCTION deduct_credits(
  target_user_id uuid,
  feature_type_param text,
  provider_param text,
  model_param text,
  prompt_length_param integer,
  base_cost_param integer,
  multiplier_param numeric,
  total_cost_param integer,
  prompt_id_param uuid DEFAULT NULL,
  success_param boolean DEFAULT true,
  error_message_param text DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  current_balance integer;
  new_balance integer;
  usage_log_id uuid;
BEGIN
  -- Get current balance
  SELECT balance INTO current_balance
  FROM user_credits
  WHERE user_id = target_user_id;
  
  -- Check if sufficient credits
  IF COALESCE(current_balance, 0) < total_cost_param THEN
    RETURN false;
  END IF;
  
  -- Calculate new balance
  new_balance := current_balance - total_cost_param;
  
  -- Update credits
  UPDATE user_credits
  SET 
    balance = new_balance,
    total_spent = total_spent + total_cost_param,
    updated_at = now()
  WHERE user_id = target_user_id;
  
  -- Log AI usage
  INSERT INTO ai_usage_logs (
    user_id,
    feature_type,
    provider,
    model,
    prompt_length,
    base_cost,
    multiplier,
    total_cost,
    prompt_id,
    success,
    error_message
  ) VALUES (
    target_user_id,
    feature_type_param,
    provider_param,
    model_param,
    prompt_length_param,
    base_cost_param,
    multiplier_param,
    total_cost_param,
    prompt_id_param,
    success_param,
    error_message_param
  ) RETURNING id INTO usage_log_id;
  
  -- Log credit transaction
  INSERT INTO credit_transactions (
    user_id,
    transaction_type,
    amount,
    balance_after,
    description,
    ai_usage_log_id
  ) VALUES (
    target_user_id,
    'spent',
    total_cost_param,
    new_balance,
    'AI ' || feature_type_param || ' usage',
    usage_log_id
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits
CREATE OR REPLACE FUNCTION add_credits(
  target_user_id uuid,
  amount_param integer,
  transaction_type_param text DEFAULT 'earned',
  description_param text DEFAULT 'Credits added'
)
RETURNS integer AS $$
DECLARE
  current_balance integer;
  new_balance integer;
BEGIN
  -- Get current balance
  SELECT balance INTO current_balance
  FROM user_credits
  WHERE user_id = target_user_id;
  
  current_balance := COALESCE(current_balance, 0);
  new_balance := current_balance + amount_param;
  
  -- Update credits
  UPDATE user_credits
  SET 
    balance = new_balance,
    total_earned = CASE 
      WHEN transaction_type_param = 'earned' THEN total_earned + amount_param
      ELSE total_earned
    END,
    updated_at = now()
  WHERE user_id = target_user_id;
  
  -- Log credit transaction
  INSERT INTO credit_transactions (
    user_id,
    transaction_type,
    amount,
    balance_after,
    description
  ) VALUES (
    target_user_id,
    transaction_type_param,
    amount_param,
    new_balance,
    description_param
  );
  
  RETURN new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user subscription info
CREATE OR REPLACE FUNCTION get_user_subscription_info(target_user_id uuid DEFAULT NULL)
RETURNS TABLE (
  plan_type text,
  status text,
  credits_balance integer,
  current_period_end timestamptz,
  can_use_ai boolean
) AS $$
DECLARE
  user_uuid uuid;
BEGIN
  user_uuid := COALESCE(target_user_id, auth.uid());
  
  RETURN QUERY
  SELECT 
    COALESCE(us.plan_type, 'free') as plan_type,
    COALESCE(us.status, 'active') as status,
    COALESCE(uc.balance, 0) as credits_balance,
    us.current_period_end,
    CASE 
      WHEN COALESCE(us.plan_type, 'free') IN ('pro', 'max') AND COALESCE(us.status, 'active') = 'active' THEN true
      ELSE false
    END as can_use_ai
  FROM profiles p
  LEFT JOIN user_subscriptions us ON us.user_id = p.id
  LEFT JOIN user_credits uc ON uc.user_id = p.id
  WHERE p.id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update onboarding progress
CREATE OR REPLACE FUNCTION update_onboarding_progress(
  step_number integer,
  step_data jsonb DEFAULT '{}'
)
RETURNS boolean AS $$
DECLARE
  current_steps jsonb;
  is_completed boolean;
BEGIN
  -- Get current steps
  SELECT steps_completed INTO current_steps
  FROM onboarding_progress
  WHERE user_id = auth.uid();
  
  -- Add step to completed steps
  current_steps := COALESCE(current_steps, '[]'::jsonb) || to_jsonb(step_number);
  
  -- Check if onboarding is complete (assuming 5 steps total)
  is_completed := jsonb_array_length(current_steps) >= 5;
  
  -- Update progress
  UPDATE onboarding_progress
  SET 
    current_step = GREATEST(current_step, step_number + 1),
    steps_completed = current_steps,
    onboarding_data = onboarding_data || step_data,
    completed = is_completed,
    completed_at = CASE WHEN is_completed THEN now() ELSE completed_at END,
    updated_at = now()
  WHERE user_id = auth.uid();
  
  RETURN is_completed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;