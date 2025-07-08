
-- Add conversation_id column to call_history table to link with conversations table
ALTER TABLE public.call_history 
ADD COLUMN conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_call_history_conversation_id ON public.call_history(conversation_id);
