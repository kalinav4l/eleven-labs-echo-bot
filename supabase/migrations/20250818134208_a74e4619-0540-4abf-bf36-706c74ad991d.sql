-- Critical Database Indexes for Performance Optimization

-- Index for kalina_agents table - most common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_kalina_agents_user_active 
ON kalina_agents(user_id, is_active) WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_kalina_agents_user_created 
ON kalina_agents(user_id, created_at DESC);

-- Index for call_history table - dashboard queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_call_history_user_date 
ON call_history(user_id, call_date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_call_history_user_status 
ON call_history(user_id, call_status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_call_history_agent_date 
ON call_history(agent_id, call_date DESC) WHERE agent_id IS NOT NULL;

-- Index for user_balance table - frequent balance checks
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_balance_user 
ON user_balance(user_id) INCLUDE (balance_usd);

-- Index for conversations table - chat history
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_user_created 
ON conversations(user_id, created_at DESC);

-- Index for phone_numbers table - outbound calls
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_phone_numbers_user_active 
ON phone_numbers(user_id, status) WHERE status = 'active';

-- Index for contact_interactions table - contact history
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contact_interactions_user_date 
ON contact_interactions(user_id, interaction_date DESC);

-- Index for contacts_database table - contact lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contacts_database_user_phone 
ON contacts_database(user_id, telefon);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contacts_database_user_status 
ON contacts_database(user_id, status) WHERE status = 'active';

-- Materialized view for user statistics (updated every 5 minutes)
CREATE MATERIALIZED VIEW IF NOT EXISTS user_stats_mv AS
SELECT 
  user_id,
  COUNT(*) as total_calls,
  SUM(duration_seconds) as total_duration,
  SUM(cost_usd) as total_cost,
  AVG(duration_seconds) as avg_duration,
  COUNT(CASE WHEN call_status IN ('success', 'done') THEN 1 END) as successful_calls,
  ROUND(
    (COUNT(CASE WHEN call_status IN ('success', 'done') THEN 1 END)::numeric / 
     NULLIF(COUNT(*), 0)) * 100, 2
  ) as success_rate,
  MAX(call_date) as last_call_date
FROM call_history 
WHERE call_date >= NOW() - INTERVAL '30 days'  -- Only last 30 days for performance
GROUP BY user_id;

-- Unique index for materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_stats_mv_user_id ON user_stats_mv (user_id);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_user_stats_mv()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_stats_mv;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function for optimized user data retrieval
CREATE OR REPLACE FUNCTION get_optimized_user_data(p_user_id uuid)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'balance', COALESCE(ub.balance_usd, 0),
    'agents', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'id', ka.id,
          'name', ka.name,
          'description', ka.description,
          'is_active', ka.is_active,
          'created_at', ka.created_at,
          'elevenlabs_agent_id', ka.elevenlabs_agent_id
        ) ORDER BY ka.created_at DESC
      ), '[]'::json)
      FROM kalina_agents ka 
      WHERE ka.user_id = p_user_id
      LIMIT 10
    ),
    'recent_calls', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'id', ch.id,
          'phone_number', ch.phone_number,
          'contact_name', ch.contact_name,
          'call_status', ch.call_status,
          'call_date', ch.call_date,
          'duration_seconds', ch.duration_seconds,
          'cost_usd', ch.cost_usd,
          'conversation_id', ch.conversation_id,
          'agent_id', ch.agent_id
        ) ORDER BY ch.call_date DESC
      ), '[]'::json)
      FROM call_history ch 
      WHERE ch.user_id = p_user_id
      LIMIT 20
    ),
    'statistics', (
      SELECT json_build_object(
        'total_calls', COALESCE(usm.total_calls, 0),
        'total_duration', COALESCE(usm.total_duration, 0),
        'total_cost', COALESCE(usm.total_cost, 0),
        'success_rate', COALESCE(usm.success_rate, 0),
        'avg_duration', COALESCE(usm.avg_duration, 0),
        'last_call_date', usm.last_call_date
      )
      FROM user_stats_mv usm
      WHERE usm.user_id = p_user_id
    )
  ) INTO result
  FROM user_balance ub
  WHERE ub.user_id = p_user_id;
  
  RETURN COALESCE(result, '{}'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;