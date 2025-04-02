
-- Create app_reviews table
CREATE TABLE IF NOT EXISTS public.app_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL DEFAULT 'Anonymous',
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Remove the unique constraint that required one review per user per app
  -- UNIQUE(app_id, user_id)
);

-- Add RLS policies for app_reviews
ALTER TABLE public.app_reviews ENABLE ROW LEVEL SECURITY;

-- Everyone can view reviews
CREATE POLICY "Anyone can view app reviews" ON public.app_reviews
  FOR SELECT USING (true);

-- Everyone can create reviews (no auth required)
CREATE POLICY "Anyone can create reviews" ON public.app_reviews
  FOR INSERT WITH CHECK (true);

-- Only review authors can update their own reviews (if they are logged in)
CREATE POLICY "Users can update their own reviews" ON public.app_reviews
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

-- Only review authors can delete their own reviews (if they are logged in)
CREATE POLICY "Users can delete their own reviews" ON public.app_reviews
  FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Add downloads column to apps table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'apps' 
    AND column_name = 'downloads'
  ) THEN
    ALTER TABLE public.apps ADD COLUMN downloads INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'apps' 
    AND column_name = 'app_url'
  ) THEN
    ALTER TABLE public.apps ADD COLUMN app_url TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'apps' 
    AND column_name = 'icon_url'
  ) THEN
    ALTER TABLE public.apps ADD COLUMN icon_url TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'apps' 
    AND column_name = 'screenshots'
  ) THEN
    ALTER TABLE public.apps ADD COLUMN screenshots TEXT[];
  END IF;
END
$$;

-- Enable realtime for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.app_reviews;
ALTER TABLE public.apps REPLICA IDENTITY FULL;
ALTER TABLE public.app_reviews REPLICA IDENTITY FULL;
