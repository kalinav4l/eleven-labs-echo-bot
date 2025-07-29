-- Create the new admin_get_all_users function without credits
CREATE OR REPLACE FUNCTION public.admin_get_all_users(p_admin_user_id uuid)
RETURNS TABLE(
  user_id uuid, 
  email text, 
  first_name text, 
  last_name text, 
  account_type text, 
  user_role public.app_role, 
  balance_usd numeric, 
  total_calls integer, 
  total_minutes numeric, 
  created_at timestamp with time zone, 
  last_sign_in timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Check if the caller is admin
  IF NOT public.has_role(p_admin_user_id, 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.email,
    p.first_name,
    p.last_name,
    p.account_type,
    COALESCE(ur.role, 'user'::public.app_role) as user_role,
    COALESCE(ub.balance_usd, 0) as balance_usd,
    COALESCE(us.total_voice_calls, 0) as total_calls,
    COALESCE(us.total_minutes_talked, 0) as total_minutes,
    p.created_at,
    au.last_sign_in_at as last_sign_in
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.id = ur.user_id
  LEFT JOIN public.user_balance ub ON p.id = ub.user_id
  LEFT JOIN public.user_statistics us ON p.id = us.user_id
  LEFT JOIN auth.users au ON p.id = au.id
  ORDER BY p.created_at DESC;
END;
$$;

-- Update handle_new_user function to remove credits creation
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