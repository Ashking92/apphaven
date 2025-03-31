
-- Create storage bucket for app assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'app_assets',
  'App Assets',
  true,
  104857600, -- 100MB limit
  '{image/png,image/jpeg,image/gif,image/webp,application/vnd.android.package-archive,application/octet-stream}'
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for the app_assets bucket
INSERT INTO storage.policies (name, bucket_id, operation, definition, policy_definition)
VALUES 
  ('App assets public access', 'app_assets', 'SELECT', 'true', '((true)::boolean)'), -- Everyone can access app assets
  ('Authenticated users can upload', 'app_assets', 'INSERT', 'authentication.role() = ''authenticated''', '((auth.role() = ''authenticated''::text))'),
  ('App admins can update', 'app_assets', 'UPDATE', '(uid() IN (SELECT id FROM public.profiles WHERE is_admin = true))', '((auth.uid() IN ( SELECT profiles.id FROM profiles WHERE (profiles.is_admin = true))))'),
  ('App admins can delete', 'app_assets', 'DELETE', '(uid() IN (SELECT id FROM public.profiles WHERE is_admin = true))', '((auth.uid() IN ( SELECT profiles.id FROM profiles WHERE (profiles.is_admin = true))))')
ON CONFLICT DO NOTHING;

-- Enable realtime on apps table if not already done
ALTER TABLE public.apps REPLICA IDENTITY FULL;
