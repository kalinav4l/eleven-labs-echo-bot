
-- Add elevenlabs_history_id column to call_history table
ALTER TABLE public.call_history 
ADD COLUMN IF NOT EXISTS elevenlabs_history_id TEXT;

-- Create index for better query performance on elevenlabs_history_id
CREATE INDEX IF NOT EXISTS idx_call_history_elevenlabs_id 
ON public.call_history(user_id, elevenlabs_history_id) 
WHERE elevenlabs_history_id IS NOT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN public.call_history.elevenlabs_history_id 
IS 'ElevenLabs conversation history ID for detailed analytics integration';
