-- Create the game_log table
CREATE TABLE public.game_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- e.g., 'TURN_START', 'CARD_PLAYED', 'ATTACK', 'EFFECT_TRIGGERED'
  event_details JSONB,      -- Contextual data for the event, e.g., { "player_id": "uuid", "card_id": "uuid", "target_id": "uuid", "value": 10 }
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.game_log ENABLE ROW LEVEL SECURITY;

-- Allow players to see game_log entries for games they are part of
CREATE POLICY "Allow participants to see game_log entries for their games" ON public.game_log
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.game_players gp
      WHERE gp.game_id = public.game_log.game_id AND gp.user_id = auth.uid()
    )
  );

-- Game logs are typically append-only and created by server logic (Edge Functions).
CREATE POLICY "Allow service_role to insert game_log entries" ON public.game_log
  FOR INSERT TO service_role WITH CHECK (true);

-- Grant basic permissions - RLS will enforce
GRANT SELECT ON TABLE public.game_log TO authenticated;
-- GRANT INSERT ON TABLE public.game_log TO service_role; (covered by service_role insert policy)

-- Add an index for querying logs by game_id and timestamp
CREATE INDEX idx_game_log_game_id_created_at ON public.game_log (game_id, created_at DESC);
