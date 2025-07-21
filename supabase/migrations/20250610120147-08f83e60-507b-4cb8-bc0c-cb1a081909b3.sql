
-- Create a public bucket for widget files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'widgets',
  'widgets',
  true,
  10485760, -- 10MB limit
  ARRAY['application/javascript', 'text/javascript']
);

-- Create policy to allow public read access to widget files
CREATE POLICY "Public read access for widgets"
ON storage.objects FOR SELECT
USING (bucket_id = 'widgets');

-- Create policy to allow authenticated users to upload widget files (for admin purposes)
CREATE POLICY "Authenticated users can upload widgets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'widgets' AND auth.role() = 'authenticated');
