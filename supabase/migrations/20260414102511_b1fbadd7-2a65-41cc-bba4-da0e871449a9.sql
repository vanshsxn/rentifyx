CREATE UNIQUE INDEX IF NOT EXISTS idx_property_ratings_unique_user_property 
ON public.property_ratings (user_id, property_id);