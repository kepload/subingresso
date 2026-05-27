-- admin_briefing_state: throttle email briefing AI Scout a 1 ogni 3 giorni.
-- Tabella singleton (id sempre = 1) per memorizzare quando l'ultima mail è partita.
-- 27 mag 2026

CREATE TABLE IF NOT EXISTS public.admin_briefing_state (
    id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    last_briefing_at timestamptz,
    last_briefing_items_count int NOT NULL DEFAULT 0,
    updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.admin_briefing_state (id, last_briefing_at, last_briefing_items_count)
VALUES (1, NULL, 0)
ON CONFLICT (id) DO NOTHING;

-- No RLS necessario: accesso esclusivo via edge function service_role.
ALTER TABLE public.admin_briefing_state ENABLE ROW LEVEL SECURITY;
