-- Create loading_videos table for managing loading screen videos
CREATE TABLE public.loading_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_url TEXT NOT NULL,
  video_path TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_seconds INTEGER,
  file_size_mb NUMERIC,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.loading_videos ENABLE ROW LEVEL SECURITY;

-- Create policies for loading videos (admin only)
CREATE POLICY "Admin can view all loading videos" 
ON public.loading_videos 
FOR SELECT 
USING (true);

CREATE POLICY "Admin can insert loading videos" 
ON public.loading_videos 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admin can update loading videos" 
ON public.loading_videos 
FOR UPDATE 
USING (true);

CREATE POLICY "Admin can delete loading videos" 
ON public.loading_videos 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_loading_videos_updated_at
BEFORE UPDATE ON public.loading_videos
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();