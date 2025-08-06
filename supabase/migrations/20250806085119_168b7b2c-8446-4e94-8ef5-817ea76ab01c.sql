-- Create webhook_configs table for user webhook management
CREATE TABLE IF NOT EXISTS public.webhook_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  webhook_url TEXT NOT NULL,
  webhook_secret TEXT,
  webhook_name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  webhook_events JSONB DEFAULT '[]',
  webhook_headers JSONB DEFAULT '{}',
  webhook_timeout INTEGER DEFAULT 30,
  retry_attempts INTEGER DEFAULT 3,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  total_calls INTEGER DEFAULT 0,
  successful_calls INTEGER DEFAULT 0,
  failed_calls INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.webhook_configs ENABLE ROW LEVEL SECURITY;

-- Create policies for webhook_configs
CREATE POLICY "Users can view their own webhook configs" 
ON public.webhook_configs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own webhook configs" 
ON public.webhook_configs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own webhook configs" 
ON public.webhook_configs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own webhook configs" 
ON public.webhook_configs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER handle_webhook_configs_updated_at
  BEFORE UPDATE ON public.webhook_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create webhook_logs table for tracking webhook calls
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_config_id UUID REFERENCES public.webhook_configs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_method TEXT DEFAULT 'POST',
  request_payload JSONB,
  request_headers JSONB,
  response_status INTEGER,
  response_body TEXT,
  response_time_ms INTEGER,
  error_message TEXT,
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for webhook_logs
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for webhook_logs
CREATE POLICY "Users can view their own webhook logs" 
ON public.webhook_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service can insert webhook logs" 
ON public.webhook_logs 
FOR INSERT 
WITH CHECK (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_webhook_configs_user_id ON public.webhook_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_configs_active ON public.webhook_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook_config_id ON public.webhook_logs(webhook_config_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_triggered_at ON public.webhook_logs(triggered_at);