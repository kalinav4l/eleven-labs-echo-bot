-- Advanced database optimizations for maximum performance (without CONCURRENTLY)

-- Add composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_call_history_user_status_date 
ON call_history(user_id, call_status, call_date DESC) 
WHERE call_status IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_conversation_analytics_user_date 
ON conversation_analytics_cache(user_id, call_date DESC) 
WHERE call_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_campaigns_user_status 
ON campaigns(user_id, status) 
WHERE status IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contacts_user_updated 
ON contacts_database(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_callback_requests_user_status_time 
ON callback_requests(user_id, status, scheduled_time) 
WHERE status = 'scheduled';

-- Partial indexes for active data only
CREATE INDEX IF NOT EXISTS idx_active_agents_active 
ON active_agents(user_id, last_activity_at DESC) 
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_kalina_agents_active 
ON kalina_agents(user_id, updated_at DESC) 
WHERE is_active = true;

-- GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_conversation_analytics_analysis_gin 
ON conversation_analytics_cache USING GIN(analysis) 
WHERE analysis IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_phone_numbers_headers_gin 
ON phone_numbers USING GIN(outbound_headers) 
WHERE outbound_headers IS NOT NULL;

-- Text search indexes
CREATE INDEX IF NOT EXISTS idx_contacts_name_text 
ON contacts_database USING GIN(to_tsvector('simple', nume)) 
WHERE nume IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_document_chunks_text_search 
ON document_chunks USING GIN(to_tsvector('english', chunk_text));

-- Expression indexes for computed columns
CREATE INDEX IF NOT EXISTS idx_call_history_duration_cost 
ON call_history((duration_seconds * cost_usd)) 
WHERE duration_seconds > 0 AND cost_usd > 0;