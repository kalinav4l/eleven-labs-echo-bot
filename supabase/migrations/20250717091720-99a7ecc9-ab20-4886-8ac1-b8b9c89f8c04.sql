-- Add caller_number column to scheduled_calls table
ALTER TABLE public.scheduled_calls 
ADD COLUMN caller_number text;

-- Add comment to explain the caller_number field
COMMENT ON COLUMN public.scheduled_calls.caller_number IS 'Phone number from which the call should be made';