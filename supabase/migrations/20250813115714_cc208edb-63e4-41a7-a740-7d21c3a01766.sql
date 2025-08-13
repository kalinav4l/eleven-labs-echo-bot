-- Creare tabel pentru persistența campaniilor de apeluri
CREATE TABLE IF NOT EXISTS campaign_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  session_id TEXT NOT NULL UNIQUE,
  agent_id TEXT NOT NULL,
  phone_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'stopped', 'completed')),
  total_contacts INTEGER NOT NULL DEFAULT 0,
  current_progress INTEGER NOT NULL DEFAULT 0,
  current_contact_name TEXT,
  call_statuses JSONB NOT NULL DEFAULT '[]'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE campaign_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own campaign sessions" 
ON campaign_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own campaign sessions" 
ON campaign_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaign sessions" 
ON campaign_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaign sessions" 
ON campaign_sessions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function for updating timestamp
CREATE OR REPLACE FUNCTION handle_campaign_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER update_campaign_sessions_updated_at
  BEFORE UPDATE ON campaign_sessions
  FOR EACH ROW
  EXECUTE FUNCTION handle_campaign_sessions_updated_at();

-- Add realtime capability
ALTER PUBLICATION supabase_realtime ADD TABLE campaign_sessions;

-- Creare tabel pentru monitorizarea agenților activi în timp real
CREATE TABLE IF NOT EXISTS active_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  agent_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'calling', 'in_conversation', 'processing')),
  current_contact_name TEXT,
  current_phone_number TEXT,
  conversation_id TEXT,
  call_started_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, agent_id)
);

-- Enable RLS pentru active_agents
ALTER TABLE active_agents ENABLE ROW LEVEL SECURITY;

-- Create policies pentru active_agents
CREATE POLICY "Users can create their own active agents" 
ON active_agents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own active agents" 
ON active_agents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own active agents" 
ON active_agents 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own active agents" 
ON active_agents 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function for updating timestamp pentru active_agents
CREATE OR REPLACE FUNCTION handle_active_agents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.last_activity_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger pentru active_agents
CREATE TRIGGER update_active_agents_updated_at
  BEFORE UPDATE ON active_agents
  FOR EACH ROW
  EXECUTE FUNCTION handle_active_agents_updated_at();

-- Add realtime capability pentru active_agents
ALTER PUBLICATION supabase_realtime ADD TABLE active_agents;