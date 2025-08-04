-- ETAPA 2: Crearea tabelei contacts_database pentru stocarea permanentă a contactelor
CREATE TABLE IF NOT EXISTS public.contacts_database (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  nume TEXT NOT NULL,
  telefon TEXT NOT NULL,
  info TEXT,
  locatie TEXT,
  tara TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, telefon)
);

-- Enable RLS
ALTER TABLE public.contacts_database ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own contacts" 
ON public.contacts_database 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contacts" 
ON public.contacts_database 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts" 
ON public.contacts_database 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts" 
ON public.contacts_database 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updating updated_at
CREATE TRIGGER contacts_database_updated_at
  BEFORE UPDATE ON public.contacts_database
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_contacts_database_user_id ON public.contacts_database(user_id);
CREATE INDEX idx_contacts_database_telefon ON public.contacts_database(telefon);
CREATE INDEX idx_contacts_database_nume ON public.contacts_database(nume);