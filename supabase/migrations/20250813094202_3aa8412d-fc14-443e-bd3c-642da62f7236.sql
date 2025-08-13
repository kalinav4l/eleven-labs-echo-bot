-- Create custom columns table to store user-defined column configurations
CREATE TABLE public.user_data_columns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  database_id UUID NOT NULL,
  column_name TEXT NOT NULL,
  column_type TEXT NOT NULL DEFAULT 'text', -- text, number, date, boolean
  is_required BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user databases table to allow multiple databases per user
CREATE TABLE public.user_databases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  webhook_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update user_data table to include database_id and custom_fields
ALTER TABLE public.user_data 
ADD COLUMN database_id UUID,
ADD COLUMN custom_fields JSONB DEFAULT '{}';

-- Add foreign key relationships
ALTER TABLE public.user_data_columns
ADD CONSTRAINT fk_user_data_columns_database 
FOREIGN KEY (database_id) REFERENCES public.user_databases(id) ON DELETE CASCADE;

-- Enable RLS for new tables
ALTER TABLE public.user_data_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_databases ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_data_columns
CREATE POLICY "Users can view their own data columns" 
ON public.user_data_columns 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own data columns" 
ON public.user_data_columns 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own data columns" 
ON public.user_data_columns 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own data columns" 
ON public.user_data_columns 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for user_databases
CREATE POLICY "Users can view their own databases" 
ON public.user_databases 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own databases" 
ON public.user_databases 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own databases" 
ON public.user_databases 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own databases" 
ON public.user_databases 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_user_data_columns_updated_at
BEFORE UPDATE ON public.user_data_columns
FOR EACH ROW
EXECUTE FUNCTION public.handle_user_data_updated_at();

CREATE TRIGGER update_user_databases_updated_at
BEFORE UPDATE ON public.user_databases
FOR EACH ROW
EXECUTE FUNCTION public.handle_user_data_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_user_data_columns_database ON public.user_data_columns(database_id);
CREATE INDEX idx_user_data_columns_user ON public.user_data_columns(user_id);
CREATE INDEX idx_user_databases_user ON public.user_databases(user_id);
CREATE INDEX idx_user_data_database ON public.user_data(database_id);

-- Insert default columns for existing users
INSERT INTO public.user_databases (user_id, name, description, is_default)
SELECT DISTINCT user_id, 'Baza Principală', 'Baza de date principală', true
FROM public.user_data
WHERE user_id IS NOT NULL;

-- Update existing user_data to link to default databases
UPDATE public.user_data 
SET database_id = (
  SELECT id 
  FROM public.user_databases 
  WHERE user_databases.user_id = user_data.user_id 
  AND is_default = true 
  LIMIT 1
)
WHERE database_id IS NULL;