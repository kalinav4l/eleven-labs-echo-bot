-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role 
      WHEN 'admin' THEN 1
      WHEN 'moderator' THEN 2
      WHEN 'user' THEN 3
    END
  LIMIT 1
$$;

-- Admin function to ban/unban users
CREATE OR REPLACE FUNCTION public.admin_ban_user(p_target_user_id UUID, p_ban_status BOOLEAN, p_admin_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if the caller is admin
  IF NOT public.has_role(p_admin_user_id, 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
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
$$;

-- Admin function to modify user credits
CREATE OR REPLACE FUNCTION public.admin_modify_credits(p_target_user_id UUID, p_credit_amount INTEGER, p_operation TEXT, p_admin_user_id UUID, p_description TEXT DEFAULT 'Admin credit modification')
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if the caller is admin
  IF NOT public.has_role(p_admin_user_id, 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Validate operation
  IF p_operation NOT IN ('add', 'subtract', 'set') THEN
    RAISE EXCEPTION 'Invalid operation. Use: add, subtract, or set';
  END IF;
  
  -- Perform the operation
  IF p_operation = 'add' THEN
    UPDATE public.user_credits
    SET total_credits = total_credits + p_credit_amount,
        updated_at = now()
    WHERE user_id = p_target_user_id;
    
    -- Add transaction record
    INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description)
    VALUES (p_target_user_id, p_credit_amount, 'admin_bonus', p_description);
    
  ELSIF p_operation = 'subtract' THEN
    UPDATE public.user_credits
    SET used_credits = used_credits + p_credit_amount,
        updated_at = now()
    WHERE user_id = p_target_user_id;
    
    -- Add transaction record
    INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description)
    VALUES (p_target_user_id, -p_credit_amount, 'admin_deduction', p_description);
    
  ELSIF p_operation = 'set' THEN
    UPDATE public.user_credits
    SET total_credits = p_credit_amount,
        used_credits = 0,
        updated_at = now()
    WHERE user_id = p_target_user_id;
    
    -- Add transaction record
    INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description)
    VALUES (p_target_user_id, p_credit_amount, 'admin_reset', p_description);
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Admin function to modify user balance
CREATE OR REPLACE FUNCTION public.admin_modify_balance(p_target_user_id UUID, p_balance_amount NUMERIC, p_operation TEXT, p_admin_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if the caller is admin
  IF NOT public.has_role(p_admin_user_id, 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Validate operation
  IF p_operation NOT IN ('add', 'subtract', 'set') THEN
    RAISE EXCEPTION 'Invalid operation. Use: add, subtract, or set';
  END IF;
  
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
$$;

-- Admin function to change user role
CREATE OR REPLACE FUNCTION public.admin_change_role(p_target_user_id UUID, p_new_role app_role, p_admin_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if the caller is admin
  IF NOT public.has_role(p_admin_user_id, 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Remove existing roles for the user
  DELETE FROM public.user_roles WHERE user_id = p_target_user_id;
  
  -- Add new role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_target_user_id, p_new_role);
  
  RETURN TRUE;
END;
$$;

-- Admin function to get all users with their info
CREATE OR REPLACE FUNCTION public.admin_get_all_users(p_admin_user_id UUID)
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  account_type TEXT,
  user_role app_role,
  total_credits INTEGER,
  used_credits INTEGER,
  remaining_credits INTEGER,
  balance_usd NUMERIC,
  total_calls INTEGER,
  total_minutes NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE,
  last_sign_in TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if the caller is admin
  IF NOT public.has_role(p_admin_user_id, 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.email,
    p.first_name,
    p.last_name,
    p.account_type,
    COALESCE(ur.role, 'user'::app_role) as user_role,
    COALESCE(uc.total_credits, 0) as total_credits,
    COALESCE(uc.used_credits, 0) as used_credits,
    COALESCE(uc.remaining_credits, 0) as remaining_credits,
    COALESCE(ub.balance_usd, 0) as balance_usd,
    COALESCE(us.total_voice_calls, 0) as total_calls,
    COALESCE(us.total_minutes_talked, 0) as total_minutes,
    p.created_at,
    au.last_sign_in_at
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.id = ur.user_id
  LEFT JOIN public.user_credits uc ON p.id = uc.user_id
  LEFT JOIN public.user_balance ub ON p.id = ub.user_id
  LEFT JOIN public.user_statistics us ON p.id = us.user_id
  LEFT JOIN auth.users au ON p.id = au.id
  ORDER BY p.created_at DESC;
END;
$$;

-- Create RLS policies for user_roles
CREATE POLICY "Admins can view all user roles" ON public.user_roles
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage user roles" ON public.user_roles
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own role" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

-- Update the handle_new_user function to assign default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

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
$$;

-- Create admin audit log table
CREATE TABLE public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES auth.users(id) NOT NULL,
  target_user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_audit_log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS policy for admin audit log
CREATE POLICY "Admins can view audit logs" ON public.admin_audit_log
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert audit logs" ON public.admin_audit_log
FOR INSERT WITH CHECK (true);

-- Create trigger for updated_at on user_roles
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();