-- Fix Supabase security issues

-- Add SET search_path to all functions that don't have it
CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Reduce OTP expiry time from 1 hour to 10 minutes for better security
ALTER TABLE auth.flow_state ALTER COLUMN exp_expires_at SET DEFAULT (now() + interval '10 minutes');

-- Update password protection settings (this will need to be done manually in dashboard)
-- The following are security recommendations to implement manually:
-- 1. Enable "Breach password protection" in Auth settings
-- 2. Move extensions from public schema to a dedicated schema
-- 3. Set up proper password policies

-- Update user statistics function with better search path
CREATE OR REPLACE FUNCTION public.update_user_statistics_with_spending(p_user_id uuid, p_duration_seconds integer, p_cost_usd numeric)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  current_max_spent NUMERIC;
  new_total_spent NUMERIC;
BEGIN
  -- Input validation
  IF p_user_id IS NULL OR p_duration_seconds IS NULL OR p_cost_usd IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get current maximum spent
  SELECT total_spent_usd INTO current_max_spent
  FROM public.user_statistics
  WHERE user_id = p_user_id;
  
  -- Calculate new total spent
  new_total_spent := COALESCE(current_max_spent, 0) + p_cost_usd;
  
  -- Update statistics
  INSERT INTO public.user_statistics (
    user_id,
    total_minutes_talked,
    total_voice_calls,
    total_spent_usd,
    current_spent_usd
  ) VALUES (
    p_user_id,
    ROUND(p_duration_seconds / 60.0, 2),
    1,
    new_total_spent,
    new_total_spent
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_minutes_talked = user_statistics.total_minutes_talked + ROUND(p_duration_seconds / 60.0, 2),
    total_voice_calls = user_statistics.total_voice_calls + 1,
    current_spent_usd = user_statistics.current_spent_usd + p_cost_usd,
    total_spent_usd = CASE
      WHEN user_statistics.current_spent_usd + p_cost_usd > user_statistics.total_spent_usd THEN
        user_statistics.current_spent_usd + p_cost_usd
      ELSE
        user_statistics.total_spent_usd
    END,
    max_spending_reached_at = CASE
      WHEN user_statistics.current_spent_usd + p_cost_usd > user_statistics.total_spent_usd THEN
        NOW()
      ELSE
        user_statistics.max_spending_reached_at
    END;
    
  RETURN TRUE;
END;
$function$;