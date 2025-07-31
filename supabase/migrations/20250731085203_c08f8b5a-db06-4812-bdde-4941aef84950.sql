-- Add caller_number column to call_history table
ALTER TABLE public.call_history 
ADD COLUMN caller_number text;