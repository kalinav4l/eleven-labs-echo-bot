-- 1. Creez înregistrarea lipsă în user_balance pentru admin-ul mariusvirlan109@gmail.com
INSERT INTO public.user_balance (user_id, balance_usd)
VALUES ('a698e3c2-f0e6-4f42-8955-971d91e725ce', 0.00)
ON CONFLICT (user_id) DO NOTHING;

-- 2. Modific funcția admin_modify_balance pentru a folosi UPSERT în loc de UPDATE simplu
CREATE OR REPLACE FUNCTION public.admin_modify_balance(p_target_user_id uuid, p_balance_amount numeric, p_operation text, p_admin_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Check if the caller is admin using the secure function
  IF NOT public.is_admin_user(p_admin_user_id) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Validate operation
  IF p_operation NOT IN ('add', 'subtract', 'set') THEN
    RAISE EXCEPTION 'Invalid operation. Use: add, subtract, or set';
  END IF;
  
  -- Log the admin action
  PERFORM public.log_admin_action(
    p_admin_user_id,
    'MODIFY_BALANCE',
    p_target_user_id,
    jsonb_build_object(
      'operation', p_operation, 
      'amount', p_balance_amount
    )
  );
  
  -- Perform the operation using UPSERT to handle missing records
  IF p_operation = 'add' THEN
    INSERT INTO public.user_balance (user_id, balance_usd)
    VALUES (p_target_user_id, p_balance_amount)
    ON CONFLICT (user_id) DO UPDATE SET
      balance_usd = user_balance.balance_usd + p_balance_amount,
      updated_at = now();
    
  ELSIF p_operation = 'subtract' THEN
    INSERT INTO public.user_balance (user_id, balance_usd)
    VALUES (p_target_user_id, 0.00)
    ON CONFLICT (user_id) DO UPDATE SET
      balance_usd = GREATEST(0, user_balance.balance_usd - p_balance_amount),
      updated_at = now();
    
  ELSIF p_operation = 'set' THEN
    INSERT INTO public.user_balance (user_id, balance_usd)
    VALUES (p_target_user_id, p_balance_amount)
    ON CONFLICT (user_id) DO UPDATE SET
      balance_usd = p_balance_amount,
      updated_at = now();
  END IF;
  
  RETURN TRUE;
END;
$function$;

-- 3. Verific și repar trigger-ul handle_new_user pentru a include user_balance
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

  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Insert initial balance of 5 dollars - FIXED: Now uses proper UPSERT
  INSERT INTO public.user_balance (user_id, balance_usd)
  VALUES (NEW.id, 5.00)
  ON CONFLICT (user_id) DO UPDATE SET
    balance_usd = COALESCE(user_balance.balance_usd, 5.00),
    updated_at = now();

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