-- Enable required extensions (safe if already enabled)
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron with schema extensions;

-- Schedule the checker every minute to run the edge function
-- Uses ANON key for Authorization; function has verify_jwt = false but header is ok
select
  cron.schedule(
    'check-scheduled-tasks-every-minute',
    '* * * * *',
    $$
    select
      net.http_post(
        url:='https://pwfczzxwjfxomqzhhwvj.supabase.co/functions/v1/check-scheduled-tasks',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3ZmN6enh3amZ4b21xemhod3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NDI5NDYsImV4cCI6MjA2NDAxODk0Nn0.IgOvpvhe3fW4OnRLN39eVfP5E1hq4lHat0lZH_1jQfs"}'::jsonb,
        body:='{}'::jsonb
      ) as request_id;
    $$
  );
