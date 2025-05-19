-- Create the game_players table to link users to games
CREATE TABLE public.game_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_order INTEGER, -- e.g., 1 or 2, can be NULL if not yet determined
  health INTEGER, -- Conceptual health, can be NULL or have a game-specific default
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE (game_id, user_id), -- A user can only be in a game once
  UNIQUE (game_id, player_order) -- Player order must be unique within a game (if not NULL)
);

-- Enable Row Level Security
ALTER TABLE public.game_players ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own game_players entries
CREATE POLICY "Allow users to see their own game_players entries" ON public.game_players
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Allow users to see game_players entries for games they are part of
CREATE POLICY "Allow participants to see game_players entries for their games" ON public.game_players
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.game_players gp
      WHERE gp.game_id = public.game_players.game_id AND gp.user_id = auth.uid()
    )
  );

-- Allow service_role or game creation logic (e.g., Edge Function) to insert game_players entries.
-- Users generally shouldn't be able to arbitrarily insert themselves into games.
CREATE POLICY "Allow service_role to insert game_players" ON public.game_players
  FOR INSERT TO service_role WITH CHECK (true);
  -- Consider a specific policy for Edge Functions if they operate under a less privileged role.

-- Allow users to update their own game_players entries (e.g., ready status - if we add such a field)
-- For now, very restrictive. Updates likely handled by Edge Functions.
CREATE POLICY "Allow users to update own game_players (limited)" ON public.game_players
  FOR UPDATE TO authenticated USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND game_id IS NOT NULL); -- Example, refine as needed

-- Trigger to automatically update updated_at on changes
CREATE TRIGGER on_game_player_updated
  BEFORE UPDATE ON public.game_players
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at(); -- Assumes handle_updated_at() exists

-- Grant basic permissions - RLS will enforce
GRANT SELECT ON TABLE public.game_players TO authenticated;
-- INSERT, UPDATE, DELETE typically handled by service_role or specific functions, not directly by users.
-- GRANT INSERT, UPDATE, DELETE ON TABLE public.game_players TO service_role;
