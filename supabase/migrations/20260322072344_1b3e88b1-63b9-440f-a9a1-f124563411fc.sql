
-- Role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'landlord', 'tenant');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Properties table
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  address TEXT NOT NULL,
  area TEXT NOT NULL,
  rent NUMERIC NOT NULL,
  rating NUMERIC DEFAULT 0,
  image_url TEXT,
  bedrooms INTEGER DEFAULT 1,
  bathrooms INTEGER DEFAULT 1,
  sqft INTEGER DEFAULT 0,
  features TEXT[] DEFAULT '{}',
  distance TEXT,
  has_vr BOOLEAN DEFAULT false,
  vr_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  phone TEXT,
  contact_email TEXT,
  video_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Favorites table
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, property_id)
);
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Tenant requests table
CREATE TABLE public.tenant_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  urgent BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tenant_requests ENABLE ROW LEVEL SECURITY;

-- Security definer function for role check
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies

-- Profiles: users can read/update own
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- User roles: users can view own roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Properties: anyone can read, landlords can CRUD own
CREATE POLICY "Anyone can view properties" ON public.properties FOR SELECT USING (true);
CREATE POLICY "Landlords can insert own properties" ON public.properties FOR INSERT WITH CHECK (auth.uid() = landlord_id);
CREATE POLICY "Landlords can update own properties" ON public.properties FOR UPDATE USING (auth.uid() = landlord_id);
CREATE POLICY "Landlords can delete own properties" ON public.properties FOR DELETE USING (auth.uid() = landlord_id);

-- Favorites: users CRUD own
CREATE POLICY "Users can view own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- Tenant requests: tenants can create/view own, landlords can view for their properties
CREATE POLICY "Tenants can create requests" ON public.tenant_requests FOR INSERT WITH CHECK (auth.uid() = tenant_id);
CREATE POLICY "Tenants can view own requests" ON public.tenant_requests FOR SELECT USING (auth.uid() = tenant_id);
CREATE POLICY "Landlords can view requests for their properties" ON public.tenant_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.properties WHERE properties.id = tenant_requests.property_id AND properties.landlord_id = auth.uid())
);
CREATE POLICY "Landlords can update request status" ON public.tenant_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.properties WHERE properties.id = tenant_requests.property_id AND properties.landlord_id = auth.uid())
);

-- Admin policies
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all requests" ON public.tenant_requests FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
