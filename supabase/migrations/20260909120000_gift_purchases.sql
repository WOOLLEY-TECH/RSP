CREATE TABLE public.gift_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gifter_name text NOT NULL,
  gifter_phone text,
  gift_id text NOT NULL,
  gift_name text NOT NULL,
  gift_price integer NOT NULL,
  gift_image text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.gift_purchases TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gift_purchases TO authenticated;
GRANT ALL ON public.gift_purchases TO service_role;
ALTER TABLE public.gift_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can purchase a gift" ON public.gift_purchases FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view gift purchases" ON public.gift_purchases FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update gift purchases" ON public.gift_purchases FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete gift purchases" ON public.gift_purchases FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_gift_purchases_created_at ON public.gift_purchases (created_at DESC);
CREATE INDEX idx_gift_purchases_gifter ON public.gift_purchases (gifter_name);