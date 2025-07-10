-- Creăm tabela pentru stocarea vectorilor de embeddings folosind JSONB
CREATE TABLE public.document_embeddings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_id UUID NOT NULL,
  agent_id UUID,
  chunk_text TEXT NOT NULL,
  embedding JSONB NOT NULL, -- Stocăm vectorul ca array JSON
  chunk_index INTEGER NOT NULL,
  document_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pentru filtrare rapidă după agent
CREATE INDEX document_embeddings_agent_idx ON public.document_embeddings(agent_id);

-- Index pentru filtrare după user
CREATE INDEX document_embeddings_user_idx ON public.document_embeddings(user_id);

-- Index GIN pentru căutări în JSONB
CREATE INDEX document_embeddings_embedding_idx ON public.document_embeddings USING GIN (embedding);

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

-- Funcție pentru calcularea similitudinii cosinus între două vectori JSON
CREATE OR REPLACE FUNCTION public.cosine_similarity(vec1 JSONB, vec2 JSONB)
RETURNS FLOAT
LANGUAGE plpgsql
AS $$
DECLARE
  dot_product FLOAT := 0;
  magnitude1 FLOAT := 0;
  magnitude2 FLOAT := 0;
  i INT;
  len INT;
BEGIN
  len := jsonb_array_length(vec1);
  
  FOR i IN 0..len-1 LOOP
    dot_product := dot_product + (vec1->>i)::FLOAT * (vec2->>i)::FLOAT;
    magnitude1 := magnitude1 + ((vec1->>i)::FLOAT * (vec1->>i)::FLOAT);
    magnitude2 := magnitude2 + ((vec2->>i)::FLOAT * (vec2->>i)::FLOAT);
  END LOOP;
  
  IF magnitude1 = 0 OR magnitude2 = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN dot_product / (sqrt(magnitude1) * sqrt(magnitude2));
END;
$$;

-- Funcție pentru căutarea documentelor cu similitudine
CREATE OR REPLACE FUNCTION public.match_document_embeddings(
  query_embedding JSONB,
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
    public.cosine_similarity(de.embedding, query_embedding) AS similarity
  FROM public.document_embeddings de
  WHERE de.agent_id = agent_id_param
    AND public.cosine_similarity(de.embedding, query_embedding) > match_threshold
  ORDER BY public.cosine_similarity(de.embedding, query_embedding) DESC
  LIMIT match_count;
END;
$$;

-- Creăm bucket pentru uploads dacă nu există
INSERT INTO storage.buckets (id, name, public) 
VALUES ('document-uploads', 'document-uploads', true)
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