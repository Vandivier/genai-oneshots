import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

console.log("Create Game function booting up!");

serve(async (req: Request) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged-in user.
    // This is how you securely get the user's ID server-side.
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get the logged-in user's details (game creator)
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error("User not found or error:", userError);
      return new Response(
        JSON.stringify({ error: "User not found or authentication error" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401, // Unauthorized
        }
      );
    }
    const creatorId = user.id;

    // Get opponent_user_id from request body
    const { opponent_user_id } = await req.json();
    if (!opponent_user_id) {
      return new Response(
        JSON.stringify({ error: "opponent_user_id is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400, // Bad Request
        }
      );
    }

    if (creatorId === opponent_user_id) {
      return new Response(
        JSON.stringify({ error: "Cannot create a game with yourself" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400, // Bad Request
        }
      );
    }

    // Use the service role client for admin-level operations like inserting into games/game_players
    // This is necessary because RLS might prevent direct insertion by users depending on policies.
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Create a new game in the 'games' table
    const { data: newGame, error: gameError } = await supabaseAdmin
      .from("games")
      .insert({ status: "lobby" })
      .select()
      .single(); // Expecting a single row to be created and returned

    if (gameError) {
      console.error("Error creating game:", gameError);
      throw gameError;
    }
    if (!newGame) {
      console.error("Game not created, but no error reported");
      throw new Error("Failed to create game record");
    }
    const gameId = newGame.id;

    // 2. Create entries in 'game_players' for both players
    const gamePlayersData = [
      { game_id: gameId, user_id: creatorId, player_order: 1 }, // Creator is player 1
      { game_id: gameId, user_id: opponent_user_id, player_order: 2 }, // Opponent is player 2
    ];
    const { error: gamePlayersError } = await supabaseAdmin
      .from("game_players")
      .insert(gamePlayersData);

    if (gamePlayersError) {
      console.error("Error creating game_players entries:", gamePlayersError);
      // Attempt to clean up the created game if players can't be added
      await supabaseAdmin.from("games").delete().eq("id", gameId);
      throw gamePlayersError;
    }

    // 3. Return the game_id
    const responseData = {
      message: "Game created successfully!",
      game_id: gameId,
    };

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in create-game function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
