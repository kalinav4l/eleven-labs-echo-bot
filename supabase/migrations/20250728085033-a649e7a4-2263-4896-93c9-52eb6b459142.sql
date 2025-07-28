-- Add columns for tracking callback analysis
ALTER TABLE public.call_history 
ADD COLUMN callback_analyzed BOOLEAN DEFAULT FALSE,
ADD COLUMN last_status_check TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for efficient querying of unanalyzed initiated conversations
CREATE INDEX idx_call_history_callback_analysis 
ON public.call_history (call_status, callback_analyzed, created_at) 
WHERE call_status = 'initiated' AND callback_analyzed = FALSE;