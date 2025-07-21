-- Creăm tabela pentru stocarea vectorilor de embeddings
CREATE TABLE public.document_embeddings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_id UUID NOT NULL,
  agent_id UUID,
  chunk_text TEXT NOT NULL,
  embedding VECTOR(1536), -- Pentru text-embedding-3-small de la OpenAI
  chunk_index INTEGER NOT NULL,
  document_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activăm extensia pentru vectori dacă nu e activă
CREATE EXTENSION IF NOT EXISTS vector;

-- Index pentru căutări vectoriale rapide
CREATE INDEX document_embeddings_vector_idx ON public.document_embeddings 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Index pentru filtrare rapidă după agent
CREATE INDEX document_embeddings_agent_idx ON public.document_embeddings(agent_id);

-- Index pentru filtrare după user
CREATE INDEX document_embeddings_user_idx ON public.document_embeddings(user_id);

-- RLS policies
ALTER TABLE public.document_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own embeddings" 
ON public.document_embeddings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own embeddings" 
ON public.document_embeddings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own embeddings" 
ON public.document_embeddings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own embeddings" 
ON public.document_embeddings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Funcție pentru căutarea vectorială cu similitudine cosinus
CREATE OR REPLACE FUNCTION public.match_document_embeddings(
  query_embedding VECTOR(1536),
  agent_id_param UUID,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  chunk_text TEXT,
  document_name TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    de.chunk_text,
    de.document_name,
    1 - (de.embedding <=> query_embedding) AS similarity
  FROM public.document_embeddings de
  WHERE de.agent_id = agent_id_param
    AND 1 - (de.embedding <=> query_embedding) > match_threshold
  ORDER BY de.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Creăm bucket pentru uploads dacă nu există
INSERT INTO storage.buckets (id, name, public) 
VALUES ('document-uploads', 'document-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Politici pentru storage
CREATE POLICY "Users can upload their own documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'document-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'document-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'document-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);