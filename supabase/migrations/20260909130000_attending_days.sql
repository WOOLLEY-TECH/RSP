ALTER TABLE public.rsvps ADD COLUMN attending_days text[] NOT NULL DEFAULT '{}';
COMMENT ON COLUMN public.rsvps.attending_days IS 'Array of days the guest will attend (Friday, Saturday, Sunday)';