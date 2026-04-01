
-- Property ratings table for tenant reviews
CREATE TABLE public.property_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating NUMERIC NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(property_id, user_id)
);

ALTER TABLE public.property_ratings ENABLE ROW LEVEL SECURITY;

-- Anyone can view ratings
CREATE POLICY "Anyone can view ratings" ON public.property_ratings
  FOR SELECT USING (true);

-- Authenticated users can insert their own ratings
CREATE POLICY "Users can rate properties" ON public.property_ratings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can update their own ratings
CREATE POLICY "Users can update own ratings" ON public.property_ratings
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Add admin_rating column to properties for admin base rating
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS admin_rating NUMERIC DEFAULT NULL;

-- Add tags column to properties (alias for features, used in knapsack)
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage RLS for avatars
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Users can update own avatars" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'avatars');

CREATE POLICY "Users can delete own avatars" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'avatars');
