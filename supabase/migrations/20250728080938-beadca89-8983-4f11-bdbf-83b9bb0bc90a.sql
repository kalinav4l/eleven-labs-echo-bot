-- Create table for user dashboard preferences
CREATE TABLE public.user_dashboard_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  preferences JSONB NOT NULL DEFAULT '{
    "enabled_widgets": ["active-agents", "monthly-calls", "consumed-credits", "elevenlabs-chart", "recent-activity"],
    "layout_style": "grid",
    "animation_speed": 1,
    "color_theme": "default",
    "widget_size": "medium",
    "auto_refresh": true,
    "show_animations": true
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_dashboard_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own dashboard preferences" 
ON public.user_dashboard_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dashboard preferences" 
ON public.user_dashboard_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dashboard preferences" 
ON public.user_dashboard_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dashboard preferences" 
ON public.user_dashboard_preferences 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_dashboard_preferences_updated_at
BEFORE UPDATE ON public.user_dashboard_preferences
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();