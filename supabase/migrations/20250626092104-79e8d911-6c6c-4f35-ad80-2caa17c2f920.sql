
-- Tabel pentru apelurile programate
CREATE TABLE public.scheduled_calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id TEXT,
  client_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  scheduled_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'missed')),
  call_duration_minutes INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.scheduled_calls ENABLE ROW LEVEL SECURITY;

-- Policy pentru ca utilizatorii să vadă doar propriile apeluri programate
CREATE POLICY "Users can view their own scheduled calls" 
  ON public.scheduled_calls 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy pentru ca utilizatorii să creeze propriile apeluri programate
CREATE POLICY "Users can create their own scheduled calls" 
  ON public.scheduled_calls 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy pentru ca utilizatorii să actualizeze propriile apeluri programate
CREATE POLICY "Users can update their own scheduled calls" 
  ON public.scheduled_calls 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy pentru ca utilizatorii să șteargă propriile apeluri programate
CREATE POLICY "Users can delete their own scheduled calls" 
  ON public.scheduled_calls 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Index pentru performanță
CREATE INDEX idx_scheduled_calls_user_date ON public.scheduled_calls(user_id, scheduled_datetime);
CREATE INDEX idx_scheduled_calls_datetime ON public.scheduled_calls(scheduled_datetime);

-- Trigger pentru actualizarea timestamp-ului
CREATE OR REPLACE FUNCTION public.handle_scheduled_calls_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_scheduled_calls_updated_at
  BEFORE UPDATE ON public.scheduled_calls
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_scheduled_calls_updated_at();
