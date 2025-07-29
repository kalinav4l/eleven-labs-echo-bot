-- Update user_balance default to 5 dollars for all users
ALTER TABLE public.user_balance ALTER COLUMN balance_usd SET DEFAULT 5.00;

-- Update existing users to have 5 dollars if they have less
UPDATE public.user_balance 
SET balance_usd = 5.00 
WHERE balance_usd < 5.00;

-- Update the handle_new_user function to give new users 5 dollars
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
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

  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Insert initial balance of 5 dollars
  INSERT INTO public.user_balance (user_id, balance_usd)
  VALUES (NEW.id, 5.00)
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
$$;