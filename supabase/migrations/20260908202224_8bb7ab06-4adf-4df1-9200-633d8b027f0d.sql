CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.grant_first_user_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_grant_admin
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_first_user_admin();

CREATE TABLE public.rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone_number text NOT NULL,
  attending boolean NOT NULL,
  additional_guests integer NOT NULL DEFAULT 0,
  guest_names text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.rsvps TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rsvps TO authenticated;
GRANT ALL ON public.rsvps TO service_role;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an rsvp" ON public.rsvps FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view rsvps" ON public.rsvps FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update rsvps" ON public.rsvps FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete rsvps" ON public.rsvps FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER rsvps_set_updated_at BEFORE UPDATE ON public.rsvps
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();