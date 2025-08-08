-- Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS default_language text DEFAULT 'ro',
ADD COLUMN IF NOT EXISTS telegram_bot_token text,
ADD COLUMN IF NOT EXISTS telegram_chat_id text;

-- Create prompts history table
CREATE TABLE IF NOT EXISTS public.prompt_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_name text NOT NULL,
  agent_type text NOT NULL,
  website_url text,
  company_name text,
  contact_number text,
  domain text,
  additional_info text,
  generated_prompt text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on prompt_history
ALTER TABLE public.prompt_history ENABLE ROW LEVEL SECURITY;

-- Create policies for prompt_history
CREATE POLICY "Users can view their own prompt history" 
ON public.prompt_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own prompts" 
ON public.prompt_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prompts" 
ON public.prompt_history 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prompts" 
ON public.prompt_history 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_prompt_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_prompt_history_updated_at
BEFORE UPDATE ON public.prompt_history
FOR EACH ROW
EXECUTE FUNCTION public.handle_prompt_history_updated_at();