-- Create a custom ENUM type for card suits
CREATE TYPE public.card_suit_enum AS ENUM (
  'CLUBS',
  'SPADES',
  'HEARTS',
  'DIAMONDS',
  'CUSTOM'
);

-- Create the card_definitions table
CREATE TABLE public.card_definitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  suit public.card_suit_enum NOT NULL,
  rank TEXT NOT NULL, -- e.g., 'A', 'K', 'Q', 'J', '10', 'CUSTOM_RANK'
  base_power INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  image_url TEXT,
  rules_metadata JSONB, -- To store structured rules like range, effects, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security for the card_definitions table
ALTER TABLE public.card_definitions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all card definitions
CREATE POLICY "Allow authenticated read access to card definitions" ON public.card_definitions
  FOR SELECT TO authenticated USING (true);

-- Allow anonymous users to read all card definitions (optional, if your game allows viewing cards before login)
CREATE POLICY "Allow anonymous read access to card definitions" ON public.card_definitions
  FOR SELECT TO anon USING (true);

-- For now, only service_role can insert/update/delete card definitions.
-- You might create specific RLS for admins later if needed.

-- Trigger to automatically update updated_at on changes
-- (Reusing the function created in the profiles migration if it's globally available,
-- otherwise, it needs to be created or referred to specifically)
CREATE TRIGGER on_card_definition_updated
  BEFORE UPDATE ON public.card_definitions
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at(); -- Assumes handle_updated_at() exists from previous migration

-- Grant basic permissions - RLS will enforce actual access
GRANT SELECT ON TABLE public.card_definitions TO authenticated, anon;
-- For admin/service roles to manage card definitions:
-- GRANT INSERT, UPDATE, DELETE ON TABLE public.card_definitions TO service_role;
