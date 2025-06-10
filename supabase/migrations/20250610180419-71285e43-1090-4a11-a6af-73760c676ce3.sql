
-- Create user_balance table for dollar balances
CREATE TABLE public.user_balance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance_usd NUMERIC NOT NULL DEFAULT 100.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for user_balance
ALTER TABLE public.user_balance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own balance" 
  ON public.user_balance 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own balance" 
  ON public.user_balance 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add missing columns to conversations table
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS cost_usd NUMERIC DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS conversation_id TEXT;

-- Update conversation_id to use the id field for existing records
UPDATE public.conversations 
SET conversation_id = id::text 
WHERE conversation_id IS NULL;

-- Create deduct_balance function
CREATE OR REPLACE FUNCTION public.deduct_balance(
  p_user_id UUID,
  p_amount NUMERIC,
  p_description TEXT DEFAULT NULL,
  p_conversation_id UUID DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  current_balance NUMERIC;
BEGIN
  -- Get current balance
  SELECT balance_usd INTO current_balance
  FROM public.user_balance
  WHERE user_id = p_user_id;
  
  -- Check if user has enough balance
  IF current_balance IS NULL OR current_balance < p_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Update balance
  UPDATE public.user_balance
  SET balance_usd = balance_usd - p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN TRUE;
END;
$$;

-- Create trigger to initialize user balance on signup
CREATE OR REPLACE FUNCTION public.initialize_user_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.user_balance (user_id, balance_usd)
  VALUES (NEW.id, 100.00)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created_balance ON auth.users;
CREATE TRIGGER on_auth_user_created_balance
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.initialize_user_balance();
