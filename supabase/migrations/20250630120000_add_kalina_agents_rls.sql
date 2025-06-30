
-- Adaugă politici RLS pentru tabela kalina_agents pentru a asigura că utilizatorii văd doar agenții lor

-- Activează RLS dacă nu este deja activat
ALTER TABLE public.kalina_agents ENABLE ROW LEVEL SECURITY;

-- Șterge politicile existente dacă există
DROP POLICY IF EXISTS "Users can view their own kalina agents" ON public.kalina_agents;
DROP POLICY IF EXISTS "Users can create their own kalina agents" ON public.kalina_agents;
DROP POLICY IF EXISTS "Users can update their own kalina agents" ON public.kalina_agents;
DROP POLICY IF EXISTS "Users can delete their own kalina agents" ON public.kalina_agents;

-- Crează politici noi
CREATE POLICY "Users can view their own kalina agents" 
  ON public.kalina_agents 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own kalina agents" 
  ON public.kalina_agents 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own kalina agents" 
  ON public.kalina_agents 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own kalina agents" 
  ON public.kalina_agents 
  FOR DELETE 
  USING (auth.uid() = user_id);
