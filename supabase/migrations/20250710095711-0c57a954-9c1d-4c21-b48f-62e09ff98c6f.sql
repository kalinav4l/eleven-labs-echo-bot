-- Create table for phone numbers with SIP trunk configuration
CREATE TABLE public.phone_numbers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  phone_number TEXT NOT NULL,
  label TEXT NOT NULL,
  elevenlabs_phone_id TEXT, -- ID from ElevenLabs API response
  
  -- Outbound Configuration
  outbound_address TEXT,
  outbound_transport TEXT DEFAULT 'tcp',
  outbound_username TEXT,
  outbound_password TEXT,
  outbound_media_encryption TEXT DEFAULT 'allowed',
  outbound_headers JSONB DEFAULT '{}',
  
  -- Inbound Configuration
  inbound_allowed_addresses TEXT[], -- Array of allowed IP addresses
  inbound_username TEXT,
  inbound_password TEXT,
  inbound_media_encryption TEXT DEFAULT 'allowed',
  inbound_allowed_numbers TEXT[], -- Array of allowed phone numbers
  
  -- Agent connection
  connected_agent_id TEXT, -- ID of the agent connected to this number
  
  -- Status and timestamps
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.phone_numbers ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own phone numbers" 
ON public.phone_numbers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own phone numbers" 
ON public.phone_numbers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own phone numbers" 
ON public.phone_numbers 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own phone numbers" 
ON public.phone_numbers 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_phone_numbers_updated_at
BEFORE UPDATE ON public.phone_numbers
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();