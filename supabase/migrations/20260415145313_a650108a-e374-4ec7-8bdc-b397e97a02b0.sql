ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS longitude double precision;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS furnish_type text DEFAULT 'unfurnished';
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS sharing_type text DEFAULT 'single';