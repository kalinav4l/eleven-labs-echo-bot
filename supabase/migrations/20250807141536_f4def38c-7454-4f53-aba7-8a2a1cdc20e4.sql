-- Remove the automatic cron job that causes multiple calls
SELECT cron.unschedule('check-scheduled-callbacks');