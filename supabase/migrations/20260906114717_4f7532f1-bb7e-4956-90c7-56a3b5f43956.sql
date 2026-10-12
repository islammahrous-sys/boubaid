CREATE TABLE public.notification_preferences (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  system_alerts BOOLEAN NOT NULL DEFAULT true,
  family_events BOOLEAN NOT NULL DEFAULT true,
  contributions BOOLEAN NOT NULL DEFAULT true,
  lineage_updates BOOLEAN NOT NULL DEFAULT true,
  articles_news BOOLEAN NOT NULL DEFAULT true,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  in_app_notifications BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_preferences TO authenticated;
GRANT ALL ON public.notification_preferences TO service_role;

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members manage their own notification preferences"
ON public.notification_preferences FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);