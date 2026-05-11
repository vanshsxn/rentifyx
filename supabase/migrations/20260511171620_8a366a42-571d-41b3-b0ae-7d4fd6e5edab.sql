
CREATE TABLE IF NOT EXISTS public.scheduled_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  landlord_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  requested_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  landlord_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.scheduled_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenants can create visits" ON public.scheduled_visits FOR INSERT WITH CHECK (auth.uid() = tenant_id);
CREATE POLICY "Tenants can view own visits" ON public.scheduled_visits FOR SELECT USING (auth.uid() = tenant_id);
CREATE POLICY "Landlords can view their visits" ON public.scheduled_visits FOR SELECT USING (auth.uid() = landlord_id);
CREATE POLICY "Tenants can cancel own visits" ON public.scheduled_visits FOR UPDATE USING (auth.uid() = tenant_id);
CREATE POLICY "Landlords can update visits" ON public.scheduled_visits FOR UPDATE USING (auth.uid() = landlord_id);
