
-- Drop all dependent triggers first
DROP TRIGGER IF EXISTS on_auth_user_created_initialize_data ON auth.users;
DROP TRIGGER IF EXISTS on_user_profile_created ON public.profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_balance ON auth.users;

-- Now we can safely drop the functions
DROP FUNCTION IF EXISTS public.initialize_user_data();
DROP FUNCTION IF EXISTS public.initialize_user_balance();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a more robust handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(new.raw_user_meta_data ->> 'last_name', ''),
    COALESCE(new.email, '')
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = COALESCE(new.raw_user_meta_data ->> 'first_name', ''),
    last_name = COALESCE(new.raw_user_meta_data ->> 'last_name', ''),
    email = COALESCE(new.email, ''),
    updated_at = now();

  -- Insert initial credits (100,000 free credits)
  INSERT INTO public.user_credits (user_id, total_credits, used_credits)
  VALUES (new.id, 100000, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Insert initial balance
  INSERT INTO public.user_balance (user_id, balance_usd)
  VALUES (new.id, 100.00)
  ON CONFLICT (user_id) DO NOTHING;

  -- Insert initial statistics
  INSERT INTO public.user_statistics (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$function$;

-- Create the trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Make sure all required columns allow NULL values to prevent conflicts
ALTER TABLE public.profiles ALTER COLUMN first_name DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN last_name DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;

-- Add unique constraints safely
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE public.user_credits ADD CONSTRAINT user_credits_user_id_unique UNIQUE (user_id);
    EXCEPTION
        WHEN duplicate_table THEN
            -- Constraint already exists, ignore
        WHEN duplicate_object THEN
            -- Constraint already exists, ignore
    END;
    
    BEGIN
        ALTER TABLE public.user_balance ADD CONSTRAINT user_balance_user_id_unique UNIQUE (user_id);
    EXCEPTION
        WHEN duplicate_table THEN
            -- Constraint already exists, ignore
        WHEN duplicate_object THEN
            -- Constraint already exists, ignore
    END;
    
    BEGIN
        ALTER TABLE public.user_statistics ADD CONSTRAINT user_statistics_user_id_unique UNIQUE (user_id);
    EXCEPTION
        WHEN duplicate_table THEN
            -- Constraint already exists, ignore
        WHEN duplicate_object THEN
            -- Constraint already exists, ignore
    END;
END $$;
