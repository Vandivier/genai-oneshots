-- Create ENUM type for card locations
CREATE TYPE public.card_location_enum AS ENUM (
  'deck',
  'hand',
  'discard',
  'field_close',
  'field_long',
  'field_remote'
);

-- Create the player_cards table
CREATE TABLE public.player_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  -- owner_player_id references the game_players table, linking card to a player in a game context
  owner_player_id UUID NOT NULL REFERENCES public.game_players(id) ON DELETE CASCADE,
  card_definition_id TEXT NOT NULL REFERENCES public.card_definitions(id) ON DELETE RESTRICT,
  current_location public.card_location_enum NOT NULL DEFAULT 'deck',
  is_face_up BOOLEAN NOT NULL DEFAULT false,
  location_index INTEGER, -- For ordering in hand, deck, field zones. Can be NULL.
  current_power INTEGER, -- Can be set initially by an Edge Function based on card_definition.base_power
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.player_cards ENABLE ROW LEVEL SECURITY;

-- Allow players to see all cards in games they are participating in.
-- Face-down cards will need to be handled by client-side logic or more specific RLS/views if data shouldn't leak.
CREATE POLICY "Allow participants to see cards in their games" ON public.player_cards
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.game_players gp
      WHERE gp.game_id = public.player_cards.game_id AND gp.user_id = auth.uid()
    )
  );

-- INSERT, UPDATE, DELETE operations on player_cards will be tightly controlled by Edge Functions.
-- Users should not be able to directly manipulate these records arbitrarily.
CREATE POLICY "Allow service_role to manage player_cards" ON public.player_cards
  FOR ALL TO service_role USING (true) WITH CHECK (true);
  -- Consider more specific policies if Edge Functions operate with a less privileged role.

-- Trigger to automatically update updated_at on changes
CREATE TRIGGER on_player_card_updated
  BEFORE UPDATE ON public.player_cards
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at(); -- Assumes handle_updated_at() exists

-- Grant basic permissions - RLS will enforce
GRANT SELECT ON TABLE public.player_cards TO authenticated;
-- GRANT INSERT, UPDATE, DELETE ON TABLE public.player_cards TO service_role; (already covered by the ALL policy for service_role)

-- Add an index for frequently queried columns
CREATE INDEX idx_player_cards_game_owner_location ON public.player_cards (game_id, owner_player_id, current_location);
