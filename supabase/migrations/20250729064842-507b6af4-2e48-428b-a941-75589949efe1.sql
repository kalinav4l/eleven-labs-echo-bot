-- Add new columns to user_statistics for expense tracking
ALTER TABLE public.user_statistics 
ADD COLUMN IF NOT EXISTS total_spent_usd NUMERIC DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS current_spent_usd NUMERIC DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS max_spending_reached_at TIMESTAMP WITH TIME ZONE;

-- Create function to update user statistics and detect new spending maximum
CREATE OR REPLACE FUNCTION public.update_user_statistics_with_spending(
  p_user_id UUID,
  p_duration_seconds INTEGER,
  p_cost_usd NUMERIC
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
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
$$;