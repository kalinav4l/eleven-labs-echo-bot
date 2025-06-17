
-- Create a dedicated table for call history with proper user isolation
CREATE TABLE public.call_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  contact_name TEXT DEFAULT 'Necunoscut',
  call_status TEXT NOT NULL DEFAULT 'unknown',
  summary TEXT,
  dialog_json TEXT, -- Store the full JSON response from webhook
  call_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  cost_usd NUMERIC(10,4) DEFAULT 0.0000,
  agent_id TEXT,
  language TEXT DEFAULT 'ro',
  duration_seconds INTEGER DEFAULT 0,
  timestamps TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security to ensure users only see their own call history
ALTER TABLE public.call_history ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view only their own call history
CREATE POLICY "Users can view their own call history" 
  ON public.call_history 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own call history
CREATE POLICY "Users can insert their own call history" 
  ON public.call_history 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own call history
CREATE POLICY "Users can update their own call history" 
  ON public.call_history 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy for users to delete their own call history
CREATE POLICY "Users can delete their own call history" 
  ON public.call_history 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create an index for better query performance on user_id and call_date
CREATE INDEX idx_call_history_user_date ON public.call_history(user_id, call_date DESC);

-- Create an index for searching by phone number
CREATE INDEX idx_call_history_phone ON public.call_history(user_id, phone_number);

-- Add trigger for updating the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_call_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_call_history_updated_at
  BEFORE UPDATE ON public.call_history
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_call_history_updated_at();
