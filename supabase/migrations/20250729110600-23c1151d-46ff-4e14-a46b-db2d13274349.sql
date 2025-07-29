-- Add a flag to call_history to track if costs have been processed
ALTER TABLE public.call_history 
ADD COLUMN IF NOT EXISTS cost_processed boolean DEFAULT false;

-- Update existing records to mark them as processed (since they've already been handled)
UPDATE public.call_history 
SET cost_processed = true 
WHERE cost_processed IS NULL OR cost_processed = false;