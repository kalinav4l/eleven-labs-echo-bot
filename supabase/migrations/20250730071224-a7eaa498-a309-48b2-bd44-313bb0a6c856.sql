-- Fix database security issues from linter results

-- 1. Fix function search paths to prevent search path injection
-- Update existing functions to have secure search paths

-- Fix function search paths for security
CREATE OR REPLACE FUNCTION public.cosine_similarity(vec1 jsonb, vec2 jsonb)
RETURNS double precision
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  dot_product FLOAT := 0;
  magnitude1 FLOAT := 0;
  magnitude2 FLOAT := 0;
  i INT;
  len INT;
BEGIN
  -- Input validation
  IF vec1 IS NULL OR vec2 IS NULL THEN
    RETURN 0;
  END IF;
  
  len := jsonb_array_length(vec1);
  
  -- Validate vector lengths match
  IF len != jsonb_array_length(vec2) OR len = 0 THEN
    RETURN 0;
  END IF;
  
  FOR i IN 0..len-1 LOOP
    dot_product := dot_product + (vec1->>i)::FLOAT * (vec2->>i)::FLOAT;
    magnitude1 := magnitude1 + ((vec1->>i)::FLOAT * (vec1->>i)::FLOAT);
    magnitude2 := magnitude2 + ((vec2->>i)::FLOAT * (vec2->>i)::FLOAT);
  END LOOP;
  
  IF magnitude1 = 0 OR magnitude2 = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN dot_product / (sqrt(magnitude1) * sqrt(magnitude2));
END;
$function$;

-- Create function to validate admin role securely
CREATE OR REPLACE FUNCTION public.is_admin_user(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'::public.app_role
  )
$function$;

-- Create audit logging function for admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_admin_user_id uuid,
  p_action text,
  p_target_user_id uuid DEFAULT NULL,
  p_details jsonb DEFAULT NULL,
  p_ip_address inet DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Validate admin user
  IF NOT public.is_admin_user(p_admin_user_id) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Insert audit log
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    action,
    target_user_id,
    details,
    ip_address
  ) VALUES (
    p_admin_user_id,
    p_action,
    p_target_user_id,
    p_details,
    p_ip_address
  );

  RETURN TRUE;
END;
$function$;

-- Update admin functions to include proper logging and use role-based access
CREATE OR REPLACE FUNCTION public.admin_ban_user(p_target_user_id uuid, p_ban_status boolean, p_admin_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Check if the caller is admin using the secure function
  IF NOT public.is_admin_user(p_admin_user_id) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Log the admin action
  PERFORM public.log_admin_action(
    p_admin_user_id,
    CASE WHEN p_ban_status THEN 'BAN_USER' ELSE 'UNBAN_USER' END,
    p_target_user_id,
    jsonb_build_object('ban_status', p_ban_status)
  );
  
  -- Update user profile to set banned status
  UPDATE public.profiles
  SET 
    account_type = CASE 
      WHEN p_ban_status THEN 'banned'
      ELSE 'regular'
    END,
    updated_at = now()
  WHERE id = p_target_user_id;
  
  RETURN TRUE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_modify_balance(p_target_user_id uuid, p_balance_amount numeric, p_operation text, p_admin_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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
  
  -- Perform the operation
  IF p_operation = 'add' THEN
    UPDATE public.user_balance
    SET balance_usd = balance_usd + p_balance_amount,
        updated_at = now()
    WHERE user_id = p_target_user_id;
    
  ELSIF p_operation = 'subtract' THEN
    UPDATE public.user_balance
    SET balance_usd = GREATEST(0, balance_usd - p_balance_amount),
        updated_at = now()
    WHERE user_id = p_target_user_id;
    
  ELSIF p_operation = 'set' THEN
    UPDATE public.user_balance
    SET balance_usd = p_balance_amount,
        updated_at = now()
    WHERE user_id = p_target_user_id;
  END IF;
  
  RETURN TRUE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_change_role(p_target_user_id uuid, p_new_role app_role, p_admin_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Check if the caller is admin using the secure function
  IF NOT public.is_admin_user(p_admin_user_id) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Log the admin action
  PERFORM public.log_admin_action(
    p_admin_user_id,
    'CHANGE_ROLE',
    p_target_user_id,
    jsonb_build_object('new_role', p_new_role)
  );
  
  -- Remove existing roles for the user
  DELETE FROM public.user_roles WHERE user_id = p_target_user_id;
  
  -- Add new role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_target_user_id, p_new_role);
  
  RETURN TRUE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_get_all_users(p_admin_user_id uuid)
RETURNS TABLE(user_id uuid, email text, first_name text, last_name text, account_type text, user_role app_role, balance_usd numeric, total_calls integer, total_minutes numeric, total_spent_usd numeric, plan text, created_at timestamp with time zone, last_sign_in timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Check if the caller is admin using the secure function
  IF NOT public.is_admin_user(p_admin_user_id) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Log the admin action
  PERFORM public.log_admin_action(
    p_admin_user_id,
    'VIEW_ALL_USERS',
    NULL,
    jsonb_build_object('action', 'bulk_user_view')
  );
  
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
    COALESCE(us.total_spent_usd, 0) as total_spent_usd,
    COALESCE(p.plan, 'starter') as plan,
    p.created_at,
    au.last_sign_in_at as last_sign_in
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.id = ur.user_id
  LEFT JOIN public.user_balance ub ON p.id = ub.user_id
  LEFT JOIN public.user_statistics us ON p.id = us.user_id
  LEFT JOIN auth.users au ON p.id = au.id
  ORDER BY p.created_at DESC;
END;
$function$;