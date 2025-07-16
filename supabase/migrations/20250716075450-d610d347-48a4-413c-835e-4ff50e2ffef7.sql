-- Create campaigns table for managing call campaigns
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  agent_id TEXT,
  sms_enabled BOOLEAN DEFAULT false,
  sms_message TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  total_contacts INTEGER DEFAULT 0,
  called_contacts INTEGER DEFAULT 0,
  successful_calls INTEGER DEFAULT 0,
  failed_calls INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create campaign_contacts table for storing contacts in campaigns
CREATE TABLE public.campaign_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  contact_name TEXT,
  call_status TEXT DEFAULT 'pending' CHECK (call_status IN ('pending', 'calling', 'completed', 'failed', 'busy')),
  call_attempts INTEGER DEFAULT 0,
  last_call_attempt TIMESTAMP WITH TIME ZONE,
  conversation_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, phone_number)
);

-- Enable Row Level Security
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_contacts ENABLE ROW LEVEL SECURITY;

-- Create policies for campaigns
CREATE POLICY "Users can create their own campaigns" 
ON public.campaigns 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own campaigns" 
ON public.campaigns 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns" 
ON public.campaigns 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns" 
ON public.campaigns 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for campaign_contacts
CREATE POLICY "Users can create contacts for their own campaigns" 
ON public.campaign_contacts 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.campaigns 
  WHERE campaigns.id = campaign_contacts.campaign_id 
  AND campaigns.user_id = auth.uid()
));

CREATE POLICY "Users can view contacts from their own campaigns" 
ON public.campaign_contacts 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.campaigns 
  WHERE campaigns.id = campaign_contacts.campaign_id 
  AND campaigns.user_id = auth.uid()
));

CREATE POLICY "Users can update contacts from their own campaigns" 
ON public.campaign_contacts 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.campaigns 
  WHERE campaigns.id = campaign_contacts.campaign_id 
  AND campaigns.user_id = auth.uid()
));

CREATE POLICY "Users can delete contacts from their own campaigns" 
ON public.campaign_contacts 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.campaigns 
  WHERE campaigns.id = campaign_contacts.campaign_id 
  AND campaigns.user_id = auth.uid()
));

-- Create triggers for updated_at
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_campaign_contacts_updated_at
  BEFORE UPDATE ON public.campaign_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_campaign_contacts_campaign_id ON public.campaign_contacts(campaign_id);
CREATE INDEX idx_campaign_contacts_status ON public.campaign_contacts(call_status);