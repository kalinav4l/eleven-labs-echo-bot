-- Remove the foreign key constraint first, then change the type
ALTER TABLE public.call_history DROP CONSTRAINT IF EXISTS call_history_conversation_id_fkey;

-- Now change the column type from UUID to TEXT to handle ElevenLabs conversation IDs
ALTER TABLE public.call_history ALTER COLUMN conversation_id TYPE TEXT;

-- Also update the conversations table to use TEXT for conversation_id
ALTER TABLE public.conversations ALTER COLUMN conversation_id TYPE TEXT;