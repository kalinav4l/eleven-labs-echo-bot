-- Critical Security Fix: Update all database functions with proper security settings
-- This prevents SQL injection and privilege escalation attacks

-- Fix handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix handle_video_generations_updated_at function  
CREATE OR REPLACE FUNCTION public.handle_video_generations_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix deduct_credits function
CREATE OR REPLACE FUNCTION public.deduct_credits(p_user_id uuid, p_amount integer, p_description text DEFAULT NULL::text, p_conversation_id uuid DEFAULT NULL::uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Input validation
  IF p_user_id IS NULL OR p_amount IS NULL OR p_amount <= 0 THEN
    RETURN FALSE;
  END IF;
  
  -- Get current remaining credits
  SELECT remaining_credits INTO current_credits
  FROM public.user_credits
  WHERE user_id = p_user_id;
  
  -- Check if user has enough credits
  IF current_credits IS NULL OR current_credits < p_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Update used credits
  UPDATE public.user_credits
  SET used_credits = used_credits + p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Create transaction record
  INSERT INTO public.credit_transactions (
    user_id, 
    amount, 
    transaction_type, 
    description, 
    conversation_id
  )
  VALUES (
    p_user_id, 
    -p_amount, 
    'usage', 
    p_description, 
    p_conversation_id
  );
  
  RETURN TRUE;
END;
$function$;

-- Fix add_credits function
CREATE OR REPLACE FUNCTION public.add_credits(p_user_id uuid, p_amount integer, p_stripe_session_id text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Input validation
  IF p_user_id IS NULL OR p_amount IS NULL OR p_amount <= 0 THEN
    RETURN FALSE;
  END IF;
  
  -- Update total credits
  UPDATE public.user_credits
  SET total_credits = total_credits + p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Create transaction record
  INSERT INTO public.credit_transactions (
    user_id, 
    amount, 
    transaction_type, 
    description, 
    stripe_session_id
  )
  VALUES (
    p_user_id, 
    p_amount, 
    'purchase', 
    'Credit package purchase', 
    p_stripe_session_id
  );
  
  RETURN TRUE;
END;
$function$;

-- Fix deduct_balance function
CREATE OR REPLACE FUNCTION public.deduct_balance(p_user_id uuid, p_amount numeric, p_description text DEFAULT NULL::text, p_conversation_id uuid DEFAULT NULL::uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  current_balance NUMERIC;
BEGIN
  -- Input validation
  IF p_user_id IS NULL OR p_amount IS NULL OR p_amount <= 0 THEN
    RETURN FALSE;
  END IF;
  
  -- Get current balance
  SELECT balance_usd INTO current_balance
  FROM public.user_balance
  WHERE user_id = p_user_id;
  
  -- Check if user has enough balance
  IF current_balance IS NULL OR current_balance < p_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Update balance
  UPDATE public.user_balance
  SET balance_usd = balance_usd - p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN TRUE;
END;
$function$;

-- Fix admin_add_credits function
CREATE OR REPLACE FUNCTION public.admin_add_credits(p_user_email text, p_amount integer, p_description text DEFAULT 'Manual credit addition by admin'::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  target_user_id UUID;
BEGIN
  -- Input validation
  IF p_user_email IS NULL OR p_amount IS NULL OR p_amount <= 0 THEN
    RETURN FALSE;
  END IF;
  
  -- Find user by email
  SELECT au.id INTO target_user_id
  FROM auth.users au
  WHERE au.email = p_user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', p_user_email;
  END IF;
  
  -- Add credits to user account
  UPDATE public.user_credits
  SET total_credits = total_credits + p_amount,
      updated_at = now()
  WHERE user_id = target_user_id;
  
  -- Create transaction record
  INSERT INTO public.credit_transactions (
    user_id, 
    amount, 
    transaction_type, 
    description
  )
  VALUES (
    target_user_id, 
    p_amount, 
    'admin_bonus', 
    p_description
  );
  
  RETURN TRUE;
END;
$function$;

-- Fix admin_get_user_credits function
CREATE OR REPLACE FUNCTION public.admin_get_user_credits(p_user_email text)
 RETURNS TABLE(user_id uuid, email text, total_credits integer, used_credits integer, remaining_credits integer, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Input validation
  IF p_user_email IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    uc.user_id,
    au.email,
    uc.total_credits,
    uc.used_credits,
    uc.remaining_credits,
    uc.created_at
  FROM public.user_credits uc
  JOIN auth.users au ON uc.user_id = au.id
  WHERE au.email = p_user_email;
END;
$function$;

-- Fix handle_call_history_updated_at function
CREATE OR REPLACE FUNCTION public.handle_call_history_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix handle_scheduled_calls_updated_at function
CREATE OR REPLACE FUNCTION public.handle_scheduled_calls_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix search_relevant_chunks function
CREATE OR REPLACE FUNCTION public.search_relevant_chunks(query_text text, agent_id_param uuid, match_count integer DEFAULT 8)
 RETURNS TABLE(chunk_text text, document_name text, rank double precision)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Input validation
  IF query_text IS NULL OR agent_id_param IS NULL OR match_count IS NULL OR match_count <= 0 THEN
    RETURN;
  END IF;
  
  -- Sanitize input to prevent injection
  query_text := TRIM(query_text);
  IF LENGTH(query_text) = 0 OR LENGTH(query_text) > 1000 THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    dc.chunk_text,
    kd.name AS document_name,
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
  LIMIT LEAST(match_count, 50); -- Limit to prevent abuse
END;
$function$;

-- Fix cosine_similarity function
CREATE OR REPLACE FUNCTION public.cosine_similarity(vec1 jsonb, vec2 jsonb)
 RETURNS double precision
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  dot_product FLOAT := 0;
  magnitude1 FLOAT := 0;
  magnitude2 FLOAT := 0;
  i INT;
  len INT;
BEGIN
  -- Input validation
  IF vec1 IS NULL OR vec2 IS NULL THEN
    RETURN 0;
  END IF;
  
  len := jsonb_array_length(vec1);
  
  -- Validate vector lengths match
  IF len != jsonb_array_length(vec2) OR len = 0 THEN
    RETURN 0;
  END IF;
  
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
$function$;

-- Fix match_document_embeddings function
CREATE OR REPLACE FUNCTION public.match_document_embeddings(query_embedding jsonb, agent_id_param uuid, match_threshold double precision DEFAULT 0.7, match_count integer DEFAULT 5)
 RETURNS TABLE(chunk_text text, document_name text, similarity double precision)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Input validation
  IF query_embedding IS NULL OR agent_id_param IS NULL THEN
    RETURN;
  END IF;
  
  -- Validate threshold and count parameters
  IF match_threshold < 0 OR match_threshold > 1 THEN
    match_threshold := 0.7;
  END IF;
  
  IF match_count IS NULL OR match_count <= 0 OR match_count > 100 THEN
    match_count := 5;
  END IF;
  
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
$function$;

-- Fix handle_transcript_updated_at function
CREATE OR REPLACE FUNCTION public.handle_transcript_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix handle_new_user function with enhanced security
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Validate user ID exists
  IF NEW.id IS NULL THEN
    RAISE EXCEPTION 'User ID cannot be null';
  END IF;

  -- Insert into profiles table
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    COALESCE(NEW.email, '')
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    last_name = COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    email = COALESCE(NEW.email, ''),
    updated_at = now();

  -- Insert initial credits (100,000 free credits)
  INSERT INTO public.user_credits (user_id, total_credits, used_credits)
  VALUES (NEW.id, 100000, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Insert initial balance
  INSERT INTO public.user_balance (user_id, balance_usd)
  VALUES (NEW.id, 100.00)
  ON CONFLICT (user_id) DO NOTHING;

  -- Insert initial statistics
  INSERT INTO public.user_statistics (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$function$;