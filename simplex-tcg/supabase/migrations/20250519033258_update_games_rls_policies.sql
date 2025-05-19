-- Update RLS policies for the public.games table to use game_players table

-- Drop the placeholder policies first (if they still exist from the original games migration)
DROP POLICY IF EXISTS "Allow authenticated users to view games (placeholder)" ON public.games;
DROP POLICY IF EXISTS "Allow authenticated users to update games (placeholder)" ON public.games;

-- Allow players participating in a game to view it
CREATE POLICY "Allow participants to view their games" ON public.games
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.game_players gp
      WHERE gp.game_id = public.games.id AND gp.user_id = auth.uid()
    )
  );

-- Allow players participating in a game to update it
CREATE POLICY "Allow participants to update their games" ON public.games
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.game_players gp
      WHERE gp.game_id = public.games.id AND gp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.game_players gp
      WHERE gp.game_id = public.games.id AND gp.user_id = auth.uid()
    )
  );

-- Note: The policy "Allow authenticated users to create games" ON public.games
-- from the original games migration (20250519032405_create_games_table.sql) is still valid and does not need to be redefined here.
