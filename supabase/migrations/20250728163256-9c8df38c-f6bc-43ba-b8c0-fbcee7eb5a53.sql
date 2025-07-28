-- Create table to map phone numbers to users for callback routing
CREATE TABLE IF NOT EXISTS public.user_phone_mapping (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  phone_number TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  primary_number BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(phone_number)
);

-- Enable RLS
ALTER TABLE public.user_phone_mapping ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own phone mappings" 
ON public.user_phone_mapping 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own phone mappings" 
ON public.user_phone_mapping 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own phone mappings" 
ON public.user_phone_mapping 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for timestamps
CREATE TRIGGER update_user_phone_mapping_updated_at
BEFORE UPDATE ON public.user_phone_mapping
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();