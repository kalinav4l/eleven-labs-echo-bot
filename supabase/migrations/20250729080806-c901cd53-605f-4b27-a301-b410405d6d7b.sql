-- Drop the existing function and recreate with new return type
DROP FUNCTION IF EXISTS public.admin_get_all_users(uuid);

-- Recreate admin_get_all_users function to include spending and plan information
CREATE OR REPLACE FUNCTION public.admin_get_all_users(p_admin_user_id uuid)
RETURNS TABLE(user_id uuid, email text, first_name text, last_name text, account_type text, user_role app_role, balance_usd numeric, total_calls integer, total_minutes numeric, total_spent_usd numeric, plan text, created_at timestamp with time zone, last_sign_in timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
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
$function$