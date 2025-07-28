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