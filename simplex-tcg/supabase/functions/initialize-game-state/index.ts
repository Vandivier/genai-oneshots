import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

console.log("Initialize Game State function booting up!");

// Helper function to shuffle an array (Fisher-Yates shuffle)
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { game_id } = await req.json();
    if (!game_id) {
      return new Response(JSON.stringify({ error: "game_id is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Use the service role client for all operations in this function
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Fetch game and players
    const { data: gameData, error: gameError } = await supabaseAdmin
      .from("games")
      .select("id, status, game_players(id, user_id)") // Fetch players related to the game
      .eq("id", game_id)
      .single();

    if (gameError || !gameData) {
      console.error("Error fetching game or game not found:", gameError);
      return new Response(
        JSON.stringify({ error: "Game not found or error fetching game" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        }
      );
    }

    if (gameData.status !== "lobby" && gameData.status !== "initializing") {
      return new Response(
        JSON.stringify({
          error: `Game status is '${gameData.status}', cannot initialize.`,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    if (!gameData.game_players || gameData.game_players.length !== 2) {
      return new Response(
        JSON.stringify({
          error: "Game must have exactly two players to initialize.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Ensure game_players is treated as an array. Types might infer it as potentially single object due to relationship.
    const playersArray = Array.isArray(gameData.game_players)
      ? gameData.game_players
      : [gameData.game_players];
    if (playersArray.length !== 2) {
      return new Response(
        JSON.stringify({
          error:
            "Game must have exactly two players to initialize (after array check).",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
    const player1 = playersArray[0];
    const player2 = playersArray[1];

    // 2. Fetch standard card definitions (first 28 cards for simplicity for now)
    // Later, this could involve player-selected decks or more complex deck building logic.
    const { data: cardDefs, error: cardDefsError } = await supabaseAdmin
      .from("card_definitions")
      .select("id, base_power")
      .limit(28); // Assuming first 28 are the standard playing cards as per seed

    if (cardDefsError || !cardDefs || cardDefs.length === 0) {
      console.error("Error fetching card definitions:", cardDefsError);
      return new Response(
        JSON.stringify({ error: "Could not fetch card definitions" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    // 3. Create decks for players in player_cards
    // Clear existing cards for this game to prevent duplicates if re-initializing
    // This should be done before creating new cards.
    const { error: deleteError } = await supabaseAdmin
      .from("player_cards")
      .delete()
      .eq("game_id", game_id);
    if (deleteError) {
      console.error("Error deleting existing player cards:", deleteError);
      throw deleteError; // Fail fast if cleanup fails
    }

    const playerCardsToInsert: any[] = [];
    [player1, player2].forEach((player) => {
      const shuffledDeck = shuffleArray([...cardDefs]); // Create a new shuffled array for each player
      shuffledDeck.forEach((cardDef, index) => {
        playerCardsToInsert.push({
          game_id: game_id,
          owner_player_id: player.id, // This is game_players.id
          card_definition_id: cardDef.id,
          current_location: "deck",
          is_face_up: false,
          location_index: index, // Represents order in deck
          current_power: cardDef.base_power,
        });
      });
    });

    const { error: playerCardsInsertError } = await supabaseAdmin
      .from("player_cards")
      .insert(playerCardsToInsert)
      .select("id"); // Select to ensure it returns data and we can check count

    if (playerCardsInsertError) {
      console.error("Error inserting player cards:", playerCardsInsertError);
      throw playerCardsInsertError;
    }

    // 4. High-card draw (revised to handle ties)
    let firstPlayerGamePlayerId: string | null = null;
    let firstPlayerUserId: string | null = null;
    let drawIteration = 0;
    const MAX_DRAW_ITERATIONS = cardDefs.length > 0 ? cardDefs.length : 28; // Max iterations based on initial deck size per player

    console.log("Starting high-card draw process...");

    while (firstPlayerUserId === null && drawIteration < MAX_DRAW_ITERATIONS) {
      drawIteration++;
      console.log(`High-card draw attempt: ${drawIteration}`);

      const fetchTopCardForPlayer = async (
        playerId: string,
        playerNumber: number
      ) => {
        const { data: cardData, error: cardError } = await supabaseAdmin
          .from("player_cards")
          .select(
            "id, owner_player_id, card_definition_id, card_definitions!inner(base_power, card_name)"
          )
          .eq("game_id", game_id)
          .eq("owner_player_id", playerId)
          .eq("current_location", "deck")
          .order("location_index", { ascending: true })
          .limit(1)
          .single();

        if (cardError || !cardData || !cardData.card_definitions) {
          console.error(
            `P${playerNumber} High Card Draw Error (iteration ${drawIteration}):`,
            cardError,
            cardData
          );
          throw new Error(
            `Could not draw card for player ${playerNumber} (ID: ${playerId}) in high-card draw.`
          );
        }
        return cardData;
      };

      const p1CardData = await fetchTopCardForPlayer(player1.id, 1);
      const p2CardData = await fetchTopCardForPlayer(player2.id, 2);

      console.log(
        `  P1 (${player1.user_id}) draws ${p1CardData.card_definitions.card_name} (Power: ${p1CardData.card_definitions.base_power})`
      );
      console.log(
        `  P2 (${player2.user_id}) draws ${p2CardData.card_definitions.card_name} (Power: ${p2CardData.card_definitions.base_power})`
      );

      // Move drawn cards to discard pile
      const cardsToDiscardIds = [p1CardData.id, p2CardData.id];
      const { error: discardError } = await supabaseAdmin
        .from("player_cards")
        .update({ current_location: "discarded", location_index: null })
        .in("id", cardsToDiscardIds);

      if (discardError) {
        console.error("Error moving high-draw cards to discard:", discardError);
        throw new Error(
          "Failed to move cards to discard during high-card draw"
        );
      }
      console.log(
        `  Cards ${p1CardData.card_definitions.card_name} and ${p2CardData.card_definitions.card_name} moved to discard.`
      );

      if (
        p1CardData.card_definitions.base_power >
        p2CardData.card_definitions.base_power
      ) {
        firstPlayerGamePlayerId = player1.id;
        firstPlayerUserId = player1.user_id;
        console.log(`  Player 1 (${player1.user_id}) wins high-card draw.`);
      } else if (
        p2CardData.card_definitions.base_power >
        p1CardData.card_definitions.base_power
      ) {
        firstPlayerGamePlayerId = player2.id;
        firstPlayerUserId = player2.user_id;
        console.log(`  Player 2 (${player2.user_id}) wins high-card draw.`);
      } else {
        console.log("  High-card draw is a tie. Drawing again.");
        // Check if decks might be exhausted before next iteration
        const checkDeckEmpty = async (playerId: string): Promise<boolean> => {
          const { count, error } = await supabaseAdmin
            .from("player_cards")
            .select("id", { count: "exact", head: true })
            .eq("game_id", game_id)
            .eq("owner_player_id", playerId)
            .eq("current_location", "deck");
          if (error) {
            console.error(
              `Error checking deck count for player ${playerId}:`,
              error
            );
            throw error; // Propagate error
          }
          return count === 0;
        };

        if (drawIteration < MAX_DRAW_ITERATIONS) {
          const p1DeckEmpty = await checkDeckEmpty(player1.id);
          const p2DeckEmpty = await checkDeckEmpty(player2.id);

          if (p1DeckEmpty && p2DeckEmpty) {
            console.warn(
              "Both players ran out of cards simultaneously during high-card draw tie-breaking. Defaulting P1 as first player."
            );
            firstPlayerGamePlayerId = player1.id; // Default to P1
            firstPlayerUserId = player1.user_id;
            break;
          } else if (p1DeckEmpty) {
            console.warn(
              "Player 1 ran out of cards during high-card draw tie-breaking. Player 2 wins by default."
            );
            firstPlayerGamePlayerId = player2.id;
            firstPlayerUserId = player2.user_id;
            break;
          } else if (p2DeckEmpty) {
            console.warn(
              "Player 2 ran out of cards during high-card draw tie-breaking. Player 1 wins by default."
            );
            firstPlayerGamePlayerId = player1.id;
            firstPlayerUserId = player1.user_id;
            break;
          }
        }
      }
    }

    if (!firstPlayerUserId) {
      // This case implies MAX_DRAW_ITERATIONS was hit without a winner, and decks weren't simultaneously empty before that.
      console.warn(
        `Max high-card draw iterations (${MAX_DRAW_ITERATIONS}) reached without a winner or unhandled deck exhaustion scenario. Defaulting to Player 1.`
      );
      firstPlayerGamePlayerId = player1.id;
      firstPlayerUserId = player1.user_id;
    }

    console.log(
      `High-card draw concluded. Determined first player: ${firstPlayerUserId} (GamePlayerID: ${firstPlayerGamePlayerId})`
    );

    // 5. Deal 3 cards to each player
    const updatePromises: Promise<any>[] = [];
    for (const player of [player1, player2]) {
      const { data: deckCards, error: deckCardsError } = await supabaseAdmin
        .from("player_cards")
        .select("id")
        .eq("game_id", game_id)
        .eq("owner_player_id", player.id)
        .eq("current_location", "deck")
        // Ensure we don't try to move the card already used for high-card draw if it was supposed to be consumed/moved
        // For now, high-card draw is just a peek, cards remain in deck to be drawn.
        .order("location_index", { ascending: true })
        .limit(3);

      if (deckCardsError || !deckCards || deckCards.length < 3) {
        console.error(
          `Card draw error for player ${player.user_id}: `,
          deckCardsError,
          deckCards
        );
        throw new Error(
          `Could not draw 3 cards for player ${player.user_id}. Needs ${
            3 - (deckCards?.length || 0)
          } more.`
        );
      }

      const cardIdsToMoveToHand = deckCards.map((c) => c.id);
      if (cardIdsToMoveToHand.length > 0) {
        updatePromises.push(
          supabaseAdmin
            .from("player_cards")
            .update({
              current_location: "hand",
              location_index: null /* Or re-index hand */,
            })
            .in("id", cardIdsToMoveToHand)
        );
      }
    }
    await Promise.all(updatePromises);

    // 6. Update game state (status, current_turn_player_id, turn_phase)
    const { error: gameUpdateError } = await supabaseAdmin
      .from("games")
      .update({
        status: "active",
        current_turn_player_id: firstPlayerUserId,
        turn_phase: "DRAW",
      })
      .eq("id", game_id);

    if (gameUpdateError) {
      console.error("Error updating game state:", gameUpdateError);
      throw gameUpdateError;
    }

    return new Response(
      JSON.stringify({
        message:
          "Game initialized successfully! First player: " + firstPlayerUserId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Error in initialize-game-state function:",
      error.message,
      error.stack
    );
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
