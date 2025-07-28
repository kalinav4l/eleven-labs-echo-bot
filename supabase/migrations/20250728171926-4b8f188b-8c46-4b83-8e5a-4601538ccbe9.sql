-- Create table for phone number to user mapping to prevent duplicate callbacks
CREATE TABLE IF NOT EXISTS public.phone_number_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  user_id UUID NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(phone_number, user_id)
);

-- Enable RLS
ALTER TABLE public.phone_number_mappings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own phone mappings" 
ON public.phone_number_mappings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own phone mappings" 
ON public.phone_number_mappings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own phone mappings" 
ON public.phone_number_mappings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own phone mappings" 
ON public.phone_number_mappings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_phone_number_mappings_updated_at
BEFORE UPDATE ON public.phone_number_mappings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();