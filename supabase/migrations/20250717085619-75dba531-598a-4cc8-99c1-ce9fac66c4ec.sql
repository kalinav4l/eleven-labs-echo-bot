-- Add task_type column to scheduled_calls table
ALTER TABLE public.scheduled_calls 
ADD COLUMN task_type text DEFAULT 'call';

-- Add comment to explain the task_type values
COMMENT ON COLUMN public.scheduled_calls.task_type IS 'Type of task: call, campaign, follow_up, smart_outreach';