-- Remove the old cron job for analyzing conversations
DROP FUNCTION IF EXISTS public.analyze_initiated_conversations();

-- Add webhook metadata to scheduled_calls table
ALTER TABLE public.scheduled_calls 
ADD COLUMN IF NOT EXISTS created_via_webhook BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS original_conversation_id TEXT,
ADD COLUMN IF NOT EXISTS webhook_payload JSONB,
ADD COLUMN IF NOT EXISTS sms_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sms_response JSONB;