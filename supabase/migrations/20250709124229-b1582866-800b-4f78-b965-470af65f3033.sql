-- Eliminăm funcția existentă și o recreăm cu tipul corect
DROP FUNCTION IF EXISTS public.search_relevant_chunks(text,uuid,integer);

-- Recreăm funcția cu tipul corect pentru rank
CREATE OR REPLACE FUNCTION public.search_relevant_chunks(
  query_text TEXT,
  agent_id_param UUID,
  match_count INT DEFAULT 8
)
RETURNS TABLE (
  chunk_text TEXT,
  document_name TEXT,
  rank DOUBLE PRECISION
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dc.chunk_text,
    kd.name AS document_name,
    -- Combinăm scorul de similaritate cu lungimea pentru un ranking mai bun
    GREATEST(
      ts_rank_cd(to_tsvector('english', dc.chunk_text), plainto_tsquery('english', query_text)),
      ts_rank_cd(to_tsvector('simple', dc.chunk_text), plainto_tsquery('simple', query_text)) * 0.8
    ) AS rank
  FROM public.document_chunks dc
  JOIN public.knowledge_documents kd ON dc.document_id = kd.id
  JOIN public.agent_documents ad ON kd.id = ad.document_id
  WHERE ad.agent_id = agent_id_param
    AND (
      to_tsvector('english', dc.chunk_text) @@ plainto_tsquery('english', query_text)
      OR 
      to_tsvector('simple', dc.chunk_text) @@ plainto_tsquery('simple', query_text)
      OR
      dc.chunk_text ILIKE '%' || query_text || '%'
    )
  ORDER BY rank DESC, length(dc.chunk_text) ASC
  LIMIT match_count;
END;
$$;