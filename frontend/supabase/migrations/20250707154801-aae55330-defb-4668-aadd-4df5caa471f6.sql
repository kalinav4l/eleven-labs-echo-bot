-- Creăm tabelul pentru istoricul de scraping
CREATE TABLE public.scraping_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  total_products INTEGER DEFAULT 0,
  total_images INTEGER DEFAULT 0,
  total_links INTEGER DEFAULT 0,
  scraping_data JSONB NOT NULL,
  scraping_type TEXT DEFAULT 'single' CHECK (scraping_type IN ('single', 'full_site')),
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'error', 'in_progress')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activăm RLS pentru tabelul scraping_history
ALTER TABLE public.scraping_history ENABLE ROW LEVEL SECURITY;

-- Politici RLS pentru scraping_history
CREATE POLICY "Users can create their own scraping history" 
ON public.scraping_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own scraping history" 
ON public.scraping_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own scraping history" 
ON public.scraping_history 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scraping history" 
ON public.scraping_history 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger pentru updated_at
CREATE TRIGGER update_scraping_history_updated_at
  BEFORE UPDATE ON public.scraping_history
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Index pentru performance
CREATE INDEX idx_scraping_history_user_id ON public.scraping_history(user_id);
CREATE INDEX idx_scraping_history_created_at ON public.scraping_history(created_at DESC);