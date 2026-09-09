CREATE TABLE public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.activity_log TO anon, authenticated;
GRANT SELECT ON public.activity_log TO authenticated;
GRANT ALL ON public.activity_log TO service_role;

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view activity log" ON public.activity_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System can insert activity log" ON public.activity_log FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE INDEX idx_activity_log_created_at ON public.activity_log (created_at DESC);
CREATE INDEX idx_activity_log_user_id ON public.activity_log (user_id);
CREATE INDEX idx_activity_log_entity ON public.activity_log (entity_type, entity_id);