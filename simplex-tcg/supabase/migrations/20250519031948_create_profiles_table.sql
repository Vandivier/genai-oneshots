-- Create the profiles table to store public user data
CREATE TABLE public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  elo_rating INTEGER DEFAULT 1000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security for the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view all profiles (adjust if profiles should not be public)
CREATE POLICY "Allow public read access to profiles" ON public.profiles
  FOR SELECT USING (true);

-- Allow users to view their own profile
CREATE POLICY "Allow individual read access to own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own profile
CREATE POLICY "Allow individual insert access for own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Allow individual update access for own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Optional: Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Optional: Trigger to automatically update updated_at on profile changes
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- Secure the profiles table by preventing public updates and deletes by default
-- RLS policies above will grant specific permissions
ALTER TABLE public.profiles OWNER TO postgres; -- or the appropriate service role
GRANT SELECT ON TABLE public.profiles TO authenticated, anon;
GRANT INSERT (user_id, username, elo_rating) ON TABLE public.profiles TO authenticated;
GRANT UPDATE (username, elo_rating) ON TABLE public.profiles TO authenticated;
-- Explicitly deny delete unless a specific policy allows it
-- GRANT DELETE ON TABLE public.profiles TO authenticated; 
