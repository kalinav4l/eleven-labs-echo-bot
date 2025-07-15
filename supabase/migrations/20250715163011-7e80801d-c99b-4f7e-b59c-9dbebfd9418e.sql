-- Add missing elevenlabs_history_id column to call_history table
ALTER TABLE public.call_history 
ADD COLUMN IF NOT EXISTS elevenlabs_history_id TEXT;