-- Create table for storing documents
CREATE TABLE public.knowledge_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for storing text chunks
CREATE TABLE public.document_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.knowledge_documents(id) ON DELETE CASCADE,
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for agents
CREATE TABLE public.ai_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create junction table for agent-document relationships
CREATE TABLE public.agent_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.knowledge_documents(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(agent_id, document_id)
);

-- Enable Row Level Security
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for knowledge_documents
CREATE POLICY "Users can view their own documents" 
ON public.knowledge_documents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents" 
ON public.knowledge_documents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" 
ON public.knowledge_documents 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" 
ON public.knowledge_documents 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for document_chunks
CREATE POLICY "Users can view chunks of their own documents" 
ON public.document_chunks 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.knowledge_documents 
    WHERE id = document_chunks.document_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create chunks for their own documents" 
ON public.document_chunks 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.knowledge_documents 
    WHERE id = document_chunks.document_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update chunks of their own documents" 
ON public.document_chunks 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.knowledge_documents 
    WHERE id = document_chunks.document_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete chunks of their own documents" 
ON public.document_chunks 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.knowledge_documents 
    WHERE id = document_chunks.document_id 
    AND user_id = auth.uid()
  )
);

-- Create RLS policies for ai_agents
CREATE POLICY "Users can view their own agents" 
ON public.ai_agents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agents" 
ON public.ai_agents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agents" 
ON public.ai_agents 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agents" 
ON public.ai_agents 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for agent_documents
CREATE POLICY "Users can view their own agent-document relationships" 
ON public.agent_documents 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.ai_agents 
    WHERE id = agent_documents.agent_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own agent-document relationships" 
ON public.agent_documents 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.ai_agents 
    WHERE id = agent_documents.agent_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own agent-document relationships" 
ON public.agent_documents 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.ai_agents 
    WHERE id = agent_documents.agent_id 
    AND user_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX idx_knowledge_documents_user_id ON public.knowledge_documents(user_id);
CREATE INDEX idx_document_chunks_document_id ON public.document_chunks(document_id);
CREATE INDEX idx_ai_agents_user_id ON public.ai_agents(user_id);
CREATE INDEX idx_agent_documents_agent_id ON public.agent_documents(agent_id);
CREATE INDEX idx_agent_documents_document_id ON public.agent_documents(document_id);

-- Add text search capability
CREATE INDEX idx_document_chunks_text_search ON public.document_chunks USING gin(to_tsvector('english', chunk_text));

-- Create function to search relevant chunks using text search
CREATE OR REPLACE FUNCTION public.search_relevant_chunks(
  query_text TEXT,
  agent_id_param UUID,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  chunk_text TEXT,
  document_name TEXT,
  rank REAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dc.chunk_text,
    kd.name AS document_name,
    ts_rank(to_tsvector('english', dc.chunk_text), plainto_tsquery('english', query_text)) AS rank
  FROM public.document_chunks dc
  JOIN public.knowledge_documents kd ON dc.document_id = kd.id
  JOIN public.agent_documents ad ON kd.id = ad.document_id
  WHERE ad.agent_id = agent_id_param
    AND to_tsvector('english', dc.chunk_text) @@ plainto_tsquery('english', query_text)
  ORDER BY ts_rank(to_tsvector('english', dc.chunk_text), plainto_tsquery('english', query_text)) DESC
  LIMIT match_count;
END;
$$;