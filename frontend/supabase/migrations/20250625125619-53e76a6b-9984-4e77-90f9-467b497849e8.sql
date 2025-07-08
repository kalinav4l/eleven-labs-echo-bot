
-- Tabel pentru salvarea transcrierilor utilizatorilor
CREATE TABLE public.user_transcripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  original_filename TEXT,
  transcript_entries JSONB NOT NULL, -- Stochează array-ul cu dialogurile structurate
  raw_text TEXT, -- Textul brut de la speech-to-text
  duration_seconds INTEGER DEFAULT 0,
  file_size_mb NUMERIC(8,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security pentru siguranță
ALTER TABLE public.user_transcripts ENABLE ROW LEVEL SECURITY;

-- Policy pentru ca utilizatorii să vadă doar propriile transcrieri
CREATE POLICY "Users can view their own transcripts" 
  ON public.user_transcripts 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy pentru ca utilizatorii să creeze propriile transcrieri
CREATE POLICY "Users can create their own transcripts" 
  ON public.user_transcripts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy pentru ca utilizatorii să actualizeze propriile transcrieri
CREATE POLICY "Users can update their own transcripts" 
  ON public.user_transcripts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy pentru ca utilizatorii să șteargă propriile transcrieri
CREATE POLICY "Users can delete their own transcripts" 
  ON public.user_transcripts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Index pentru performanță
CREATE INDEX idx_user_transcripts_user_date ON public.user_transcripts(user_id, created_at DESC);

-- Trigger pentru actualizarea timestamp-ului
CREATE OR REPLACE FUNCTION public.handle_transcript_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_transcript_updated_at
  BEFORE UPDATE ON public.user_transcripts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_transcript_updated_at();
