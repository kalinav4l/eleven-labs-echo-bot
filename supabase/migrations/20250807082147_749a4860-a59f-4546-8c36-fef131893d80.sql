-- Create atomic transaction function for call processing
CREATE OR REPLACE FUNCTION public.execute_atomic_call_transaction(
  p_user_id uuid,
  p_amount numeric,
  p_duration_seconds integer,
  p_description text,
  p_conversation_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  current_balance NUMERIC;
BEGIN
  -- Start atomic transaction
  BEGIN
    -- Check and deduct balance
    SELECT balance_usd INTO current_balance
    FROM public.user_balance
    WHERE user_id = p_user_id
    FOR UPDATE; -- Lock the row to prevent race conditions
    
    -- Validate balance
    IF current_balance IS NULL OR current_balance < p_amount THEN
      RAISE EXCEPTION 'Insufficient balance: current=%, required=%', current_balance, p_amount;
    END IF;
    
    -- Deduct balance
    UPDATE public.user_balance
    SET balance_usd = balance_usd - p_amount,
        updated_at = now()
    WHERE user_id = p_user_id;
    
    -- Update statistics atomically
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
      p_amount,
      p_amount
    )
    ON CONFLICT (user_id) DO UPDATE SET
      total_minutes_talked = user_statistics.total_minutes_talked + ROUND(p_duration_seconds / 60.0, 2),
      total_voice_calls = user_statistics.total_voice_calls + 1,
      current_spent_usd = user_statistics.current_spent_usd + p_amount,
      total_spent_usd = CASE
        WHEN user_statistics.current_spent_usd + p_amount > user_statistics.total_spent_usd THEN
          user_statistics.current_spent_usd + p_amount
        ELSE
          user_statistics.total_spent_usd
      END,
      max_spending_reached_at = CASE
        WHEN user_statistics.current_spent_usd + p_amount > user_statistics.total_spent_usd THEN
          NOW()
        ELSE
          user_statistics.max_spending_reached_at
      END;
    
    -- Log the transaction for audit
    INSERT INTO public.balance_transactions (
      user_id,
      amount,
      transaction_type,
      description,
      conversation_id,
      created_at
    ) VALUES (
      p_user_id,
      -p_amount,
      'call_deduction',
      p_description,
      p_conversation_id,
      now()
    );
    
    RETURN TRUE;
    
  EXCEPTION
    WHEN OTHERS THEN
      -- Transaction will auto-rollback on exception
      RAISE;
  END;
END;
$$;

-- Create balance transactions table for audit trail
CREATE TABLE IF NOT EXISTS public.balance_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  transaction_type text NOT NULL,
  description text,
  conversation_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.balance_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own balance transactions" 
ON public.balance_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert balance transactions" 
ON public.balance_transactions 
FOR INSERT 
WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_balance_transactions_user_id ON public.balance_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_created_at ON public.balance_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_conversation_id ON public.balance_transactions(conversation_id);

-- Trigger for updated_at
CREATE TRIGGER handle_balance_transactions_updated_at
  BEFORE UPDATE ON public.balance_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();