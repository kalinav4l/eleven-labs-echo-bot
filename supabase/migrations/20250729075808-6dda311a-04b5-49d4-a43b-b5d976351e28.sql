-- Drop credit-related functions first
DROP FUNCTION IF EXISTS public.deduct_credits(uuid, integer, text, uuid);
DROP FUNCTION IF EXISTS public.add_credits(uuid, integer, text);
DROP FUNCTION IF EXISTS public.admin_add_credits(text, integer, text);
DROP FUNCTION IF EXISTS public.admin_get_user_credits(text);
DROP FUNCTION IF EXISTS public.admin_modify_credits(uuid, integer, text, uuid, text);

-- Drop the admin_get_all_users function completely before recreating
DROP FUNCTION IF EXISTS public.admin_get_all_users(uuid);

-- Drop credit-related tables
DROP TABLE IF EXISTS public.credit_transactions;
DROP TABLE IF EXISTS public.user_credits; 
DROP TABLE IF EXISTS public.credit_packages;