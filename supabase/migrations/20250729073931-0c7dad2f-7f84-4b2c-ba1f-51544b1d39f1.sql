-- First, let's drop existing policies and recreate them
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

-- Assign admin role to the specific user
INSERT INTO public.user_roles (user_id, role)
VALUES ('a698e3c2-f0e6-4f42-8955-971d91e725ce', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Create RLS policies for user_roles table
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));