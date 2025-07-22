
-- Add is_active column to kalina_agents table
ALTER TABLE public.kalina_agents 
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
