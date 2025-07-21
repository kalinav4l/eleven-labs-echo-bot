
-- Create table for Kalina agents
CREATE TABLE public.kalina_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT,
  voice_id TEXT DEFAULT '21m00Tcm4TlvDq8ikWAM',
  provider TEXT DEFAULT 'custom' CHECK (provider IN ('custom', 'elevenlabs')),
  elevenlabs_agent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.kalina_agents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own kalina agents" 
  ON public.kalina_agents 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own kalina agents" 
  ON public.kalina_agents 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own kalina agents" 
  ON public.kalina_agents 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own kalina agents" 
  ON public.kalina_agents 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER handle_updated_at_kalina_agents
  BEFORE UPDATE ON public.kalina_agents
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
