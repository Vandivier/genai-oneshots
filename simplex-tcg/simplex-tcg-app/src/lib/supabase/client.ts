import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase"; // Adjust the path if your types are elsewhere

// Ensure that the environment variables are not undefined
// You might want to add more robust error handling or default values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
}

if (!supabaseAnonKey) {
  throw new Error(
    "Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

export const supabase = createClientComponentClient<Database>({
  supabaseUrl,
  supabaseKey: supabaseAnonKey,
});
