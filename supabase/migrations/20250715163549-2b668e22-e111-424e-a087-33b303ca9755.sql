-- Fix conversation_id column type from UUID to TEXT to handle ElevenLabs conversation IDs
ALTER TABLE public.call_history ALTER COLUMN conversation_id TYPE TEXT;