-- Create workflow_columns table for user-defined workflow columns
CREATE TABLE IF NOT EXISTS public.workflow_columns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  prompt text,
  status_filters text[] DEFAULT '{}'::text[],
  agent_ids text[] DEFAULT '{}'::text[],
  is_default boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 0,
  color text,
  icon text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT workflow_columns_name_len CHECK (char_length(name) BETWEEN 1 AND 120)
);

-- Enable Row Level Security
ALTER TABLE public.workflow_columns ENABLE ROW LEVEL SECURITY;

-- Policies for CRUD by owner
DROP POLICY IF EXISTS "Users can view their own workflow columns" ON public.workflow_columns;
CREATE POLICY "Users can view their own workflow columns"
ON public.workflow_columns
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own workflow columns" ON public.workflow_columns;
CREATE POLICY "Users can create their own workflow columns"
ON public.workflow_columns
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own workflow columns" ON public.workflow_columns;
CREATE POLICY "Users can update their own workflow columns"
ON public.workflow_columns
FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own workflow columns" ON public.workflow_columns;
CREATE POLICY "Users can delete their own workflow columns"
ON public.workflow_columns
FOR DELETE
USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workflow_columns_user
  ON public.workflow_columns(user_id);

CREATE INDEX IF NOT EXISTS idx_workflow_columns_user_active_pos
  ON public.workflow_columns(user_id, is_active, position);

CREATE INDEX IF NOT EXISTS idx_workflow_columns_user_name
  ON public.workflow_columns(user_id, name);

-- Ensure unique names per user (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS uq_workflow_columns_user_name
  ON public.workflow_columns(user_id, lower(name));

-- updated_at trigger
DROP TRIGGER IF EXISTS handle_workflow_columns_updated_at ON public.workflow_columns;
CREATE TRIGGER handle_workflow_columns_updated_at
BEFORE UPDATE ON public.workflow_columns
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();