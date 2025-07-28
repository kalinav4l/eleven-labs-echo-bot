-- Enable pg_cron and pg_net extensions for automated tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create the cron job to run every 5 minutes
SELECT cron.schedule(
  'analyze-initiated-conversations-auto',
  '*/5 * * * *', -- every 5 minutes
  $$
  SELECT
    net.http_post(
        url:='https://pwfczzxwjfxomqzhhwvj.supabase.co/functions/v1/analyze-initiated-conversations',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3ZmN6enh3amZ4b21xemhod3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NDI5NDYsImV4cCI6MjA2NDAxODk0Nn0.IgOvpvhe3fW4OnRLN39eVfP5E1hq4lHat0lZH_1jQfs"}'::jsonb,
        body:=concat('{"automated": true, "time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);