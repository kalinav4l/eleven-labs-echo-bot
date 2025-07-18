
-- Create conversation analytics cache table
CREATE TABLE public.conversation_analytics_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  conversation_id TEXT NOT NULL,
  agent_id TEXT,
  agent_name TEXT,
  phone_number TEXT,
  contact_name TEXT,
  call_status TEXT,
  duration_seconds INTEGER DEFAULT 0,
  cost_credits INTEGER DEFAULT 0,
  transcript JSONB,
  metadata JSONB,
  analysis JSONB,
  call_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, conversation_id)
);

-- Add RLS policies for conversation analytics cache
ALTER TABLE public.conversation_analytics_cache ENABLE ROW LEVEL SECURITY;

-- Users can view their own cached conversations
CREATE POLICY "Users can view their own cached conversations" 
  ON public.conversation_analytics_cache 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert their own cached conversations
CREATE POLICY "Users can insert their own cached conversations" 
  ON public.conversation_analytics_cache 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own cached conversations
CREATE POLICY "Users can update their own cached conversations" 
  ON public.conversation_analytics_cache 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own cached conversations
CREATE POLICY "Users can delete their own cached conversations" 
  ON public.conversation_analytics_cache 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER handle_conversation_analytics_cache_updated_at
  BEFORE UPDATE ON public.conversation_analytics_cache
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Add index for performance
CREATE INDEX idx_conversation_analytics_cache_user_id_conversation_id 
  ON public.conversation_analytics_cache(user_id, conversation_id);

CREATE INDEX idx_conversation_analytics_cache_call_date 
  ON public.conversation_analytics_cache(call_date DESC);
