-- Create credit packages table for pricing plans
CREATE TABLE public.credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  credits INTEGER NOT NULL,
  price_usd INTEGER NOT NULL, -- Price in cents
  price_monthly INTEGER NOT NULL, -- Monthly price in cents
  price_yearly INTEGER NOT NULL, -- Yearly price in cents
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  stripe_price_id_monthly TEXT, -- Stripe price ID for monthly subscription
  stripe_price_id_yearly TEXT, -- Stripe price ID for yearly subscription
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;

-- Anyone can view active packages
CREATE POLICY "Anyone can view active credit packages" 
ON public.credit_packages 
FOR SELECT 
USING (is_active = true);

-- Only authenticated users can modify packages (for admin)
CREATE POLICY "Authenticated users can manage packages" 
ON public.credit_packages 
FOR ALL 
USING (auth.role() = 'authenticated');

-- Insert the pricing plans
INSERT INTO public.credit_packages (name, description, credits, price_usd, price_monthly, price_yearly, is_popular, features) VALUES
('GRATUIT', 'Perfect pentru testare', 0, 0, 0, 0, false, '[
  "33 minute incluse",
  "Toate funcționalitățile AI", 
  "Fără card de credit",
  "Support prin email"
]'::jsonb),

('BRONZE', 'Pentru utilizatori ocazionali', 660, 9900, 9900, 9504, true, '[
  "660 minute incluse",
  "$0.15/minut suplimentar",
  "Analytics de bază",
  "Priority support",
  "Integrări API"
]'::jsonb),

('SILVER', 'Pentru utilizatori activi', 3333, 50000, 50000, 48000, false, '[
  "3,333 minute incluse",
  "$0.15/minut suplimentar", 
  "Analytics avansate",
  "Priority support",
  "Rapoarte detaliate",
  "White-label basic"
]'::jsonb),

('ENTERPRISE', 'Pentru companii mari', 0, 0, 0, 0, false, '[
  "Minute nelimitate",
  "Prețuri personalizate",
  "White-label complet",
  "Account manager dedicat",
  "Integrări personalizate",
  "SLA garantat"
]'::jsonb);

-- Create trigger for updated_at
CREATE TRIGGER update_credit_packages_updated_at
  BEFORE UPDATE ON public.credit_packages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();