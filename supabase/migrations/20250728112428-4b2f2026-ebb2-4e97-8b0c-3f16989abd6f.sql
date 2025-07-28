-- Create callback_requests table
CREATE TABLE public.callback_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  priority TEXT NOT NULL DEFAULT 'medium',
  reason TEXT,
  description TEXT,
  notes TEXT,
  agent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.callback_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own callback requests" 
ON public.callback_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own callback requests" 
ON public.callback_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own callback requests" 
ON public.callback_requests 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own callback requests" 
ON public.callback_requests 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER handle_callback_requests_updated_at
BEFORE UPDATE ON public.callback_requests
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create cron job to check for scheduled callbacks every minute
SELECT cron.schedule(
  'check-scheduled-callbacks',
  '* * * * *', -- Every minute
  $$
  SELECT
    net.http_post(
        url:='https://pwfczzxwjfxomqzhhwvj.supabase.co/functions/v1/check-scheduled-tasks',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3ZmN6enh3amZ4b21xemhod3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NDI5NDYsImV4cCI6MjA2NDAxODk0Nn0.IgOvpvhe3fW4OnRLN39eVfP5E1hq4lHat0lZH_1jQfs"}'::jsonb,
        body:='{"task_type": "callback"}'::jsonb
    ) as request_id;
  $$
);

-- Create function to automatically schedule callbacks
CREATE OR REPLACE FUNCTION schedule_callback_call()
RETURNS TRIGGER AS $$
BEGIN
  -- Only schedule if status is 'scheduled' and scheduled_time is in the future
  IF NEW.status = 'scheduled' AND NEW.scheduled_time > NOW() THEN
    INSERT INTO public.scheduled_calls (
      user_id,
      client_name,
      phone_number,
      agent_id,
      scheduled_datetime,
      task_type,
      priority,
      description,
      notes,
      status
    ) VALUES (
      NEW.user_id,
      NEW.client_name,
      NEW.phone_number,
      NEW.agent_id,
      NEW.scheduled_time,
      'callback',
      NEW.priority,
      NEW.reason,
      NEW.notes,
      'scheduled'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic callback scheduling
CREATE TRIGGER schedule_callback_trigger
  AFTER INSERT ON public.callback_requests
  FOR EACH ROW
  EXECUTE FUNCTION schedule_callback_call();