-- Update new user credits to give only 5 minutes (33 credits equivalent)
-- 1 minute costs approximately 6.67 credits at $0.15/minute rate
-- 5 minutes = 33 credits

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Validate user ID exists
  IF NEW.id IS NULL THEN
    RAISE EXCEPTION 'User ID cannot be null';
  END IF;

  -- Insert into profiles table
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    COALESCE(NEW.email, '')
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    last_name = COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    email = COALESCE(NEW.email, ''),
    updated_at = now();

  -- Insert initial credits (33 credits = 5 minutes at $0.15/minute)
  INSERT INTO public.user_credits (user_id, total_credits, used_credits)
  VALUES (NEW.id, 33, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Insert initial balance
  INSERT INTO public.user_balance (user_id, balance_usd)
  VALUES (NEW.id, 100.00)
  ON CONFLICT (user_id) DO NOTHING;

  -- Insert initial statistics
  INSERT INTO public.user_statistics (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$function$;

-- Clear existing credit packages and add new minute-based plans
DELETE FROM public.credit_packages;

-- Insert new minute-based credit packages
INSERT INTO public.credit_packages (name, price_usd, credits, stripe_price_id) VALUES
('Bronze Plan', 3000, 1334, NULL),  -- $30 for 200 minutes (1334 credits)
('Silver Plan', 7500, 3334, NULL);  -- $75 for 500 minutes (3334 credits)

-- Note: Free plan (5 minutes) is handled by initial user credits
-- Enterprise plan is custom and handled separately