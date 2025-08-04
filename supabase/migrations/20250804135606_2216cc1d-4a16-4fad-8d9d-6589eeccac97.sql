-- Enhance contacts_database table with additional fields
ALTER TABLE public.contacts_database 
ADD COLUMN IF NOT EXISTS last_contact_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS tags text[],
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS company text,
ADD COLUMN IF NOT EXISTS email text;

-- Create contact_interactions table for call history
CREATE TABLE IF NOT EXISTS public.contact_interactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  contact_id uuid NOT NULL REFERENCES public.contacts_database(id) ON DELETE CASCADE,
  interaction_type text NOT NULL DEFAULT 'call',
  interaction_date timestamp with time zone NOT NULL DEFAULT now(),
  duration_seconds integer,
  summary text,
  agent_id text,
  conversation_id text,
  call_status text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on contact_interactions
ALTER TABLE public.contact_interactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contact_interactions
CREATE POLICY "Users can view their own contact interactions"
ON public.contact_interactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contact interactions"
ON public.contact_interactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contact interactions"
ON public.contact_interactions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contact interactions"
ON public.contact_interactions
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_contact_interactions_user_id ON public.contact_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_interactions_contact_id ON public.contact_interactions(contact_id);
CREATE INDEX IF NOT EXISTS idx_contacts_database_phone ON public.contacts_database(telefon);

-- Create trigger for updated_at
CREATE TRIGGER update_contact_interactions_updated_at
BEFORE UPDATE ON public.contact_interactions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();