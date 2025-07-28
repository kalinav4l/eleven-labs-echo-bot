-- Create table to track call sessions with correct agent mapping
CREATE TABLE IF NOT EXISTS public.call_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  agent_owner_user_id UUID NOT NULL,
  phone_number TEXT,
  contact_name TEXT,
  session_type TEXT NOT NULL DEFAULT 'voice_test', -- 'voice_test', 'phone_call'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.call_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own call sessions" 
ON public.call_sessions 
FOR SELECT 
USING (auth.uid() = agent_owner_user_id);

CREATE POLICY "Users can create their own call sessions" 
ON public.call_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = agent_owner_user_id);

-- Create trigger for timestamps
CREATE TRIGGER update_call_sessions_updated_at
BEFORE UPDATE ON public.call_sessions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();