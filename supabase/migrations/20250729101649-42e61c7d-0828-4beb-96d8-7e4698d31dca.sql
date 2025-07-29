-- Insert user balance for existing user if not exists
INSERT INTO public.user_balance (user_id, balance_usd) 
SELECT auth.uid(), 100.00
WHERE auth.uid() IS NOT NULL 
  AND NOT EXISTS (
    SELECT 1 FROM public.user_balance 
    WHERE user_id = auth.uid()
  );