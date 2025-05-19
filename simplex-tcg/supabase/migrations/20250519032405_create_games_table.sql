-- Create ENUM type for game status
CREATE TYPE public.game_status_enum AS ENUM (
  'lobby',
  'initializing', -- e.g., for high-card draw
  'active',
  'finished',
  'abandoned'
);

-- Create ENUM type for turn phases
CREATE TYPE public.turn_phase_enum AS ENUM (
  'DRAW',
  'PREPARATION',
  'BATTLE',
  'END'
);

-- Create the games table
CREATE TABLE public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  current_turn_player_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Player whose turn it is
  turn_phase public.turn_phase_enum,
  status public.game_status_enum NOT NULL DEFAULT 'lobby',
  winner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Who won the game
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to create new games
CREATE POLICY "Allow authenticated users to create games" ON public.games
  FOR INSERT TO authenticated WITH CHECK (true);

-- Allow players participating in a game to view it
-- This policy will likely need to be augmented by a JOIN with game_players table once it exists
-- For now, a placeholder allowing authenticated users to see any game for simplicity.
-- WARNING: This is too permissive for production and should be refined.
CREATE POLICY "Allow authenticated users to view games (placeholder)" ON public.games
  FOR SELECT TO authenticated USING (true);
  -- Ideal policy: USING (EXISTS (SELECT 1 FROM game_players gp WHERE gp.game_id = id AND gp.user_id = auth.uid()));

-- Allow players participating in a game to update it (e.g., change turn, status)
-- Similar to select, this is a placeholder and needs refinement with game_players.
-- WARNING: This is too permissive for production and should be refined.
CREATE POLICY "Allow authenticated users to update games (placeholder)" ON public.games
  FOR UPDATE TO authenticated USING (true)
  WITH CHECK (true);
  -- Ideal policy: USING (EXISTS (SELECT 1 FROM game_players gp WHERE gp.game_id = id AND gp.user_id = auth.uid()));

-- Trigger to automatically update updated_at on changes
CREATE TRIGGER on_game_updated
  BEFORE UPDATE ON public.games
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at(); -- Assumes handle_updated_at() exists

-- Grant basic permissions - RLS will enforce
GRANT SELECT, INSERT, UPDATE ON TABLE public.games TO authenticated;
-- GRANT DELETE ON TABLE public.games TO authenticated; -- If games can be deleted by users
