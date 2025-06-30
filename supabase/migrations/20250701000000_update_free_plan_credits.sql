-- Update free plan users to have 100 starting credits
-- This migration updates existing users and modifies the initialization function

-- First, update existing free plan users who have 0 credits to get 100 credits
UPDATE user_credits 
SET balance = 100 
WHERE user_id IN (
  SELECT us.user_id 
  FROM user_subscriptions us 
  WHERE us.plan_type = 'free' 
  AND us.status = 'active'
) 
AND balance = 0;

-- Update the initialize_user_subscription function to give 100 credits to new free users
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
