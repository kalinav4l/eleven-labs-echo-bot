-- Add more critical indexes

CREATE INDEX IF NOT EXISTS idx_kalina_agents_user_created 
ON kalina_agents(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_call_history_user_date 
ON call_history(user_id, call_date DESC);

CREATE INDEX IF NOT EXISTS idx_user_balance_user 
ON user_balance(user_id);