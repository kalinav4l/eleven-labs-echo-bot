-- Create critical indexes one by one (outside transaction block)

-- Index for kalina_agents table - most common queries
CREATE INDEX IF NOT EXISTS idx_kalina_agents_user_active 
ON kalina_agents(user_id, is_active) WHERE is_active = true;