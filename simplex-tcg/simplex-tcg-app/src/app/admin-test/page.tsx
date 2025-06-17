"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase"; // Assuming you have this from supabase codegen

export default function AdminTestPage() {
  const supabase = createClientComponentClient<Database>();
  const [opponentUserId, setOpponentUserId] = useState<string>("");
  const [gameId, setGameId] = useState<string | null>(null);
  const [createGameMessage, setCreateGameMessage] = useState<string>("");
  const [initGameMessage, setInitGameMessage] = useState<string>("");
  const [isLoadingCreate, setIsLoadingCreate] = useState<boolean>(false);
  const [isLoadingInit, setIsLoadingInit] = useState<boolean>(false);

  const handleCreateGame = async () => {
    if (!opponentUserId.trim()) {
      setCreateGameMessage("Opponent User ID is required.");
      return;
    }
    setIsLoadingCreate(true);
    setCreateGameMessage("");
    setGameId(null);
    setInitGameMessage("");

    try {
      const { data, error } = await supabase.functions.invoke("create-game", {
        body: { opponent_user_id: opponentUserId },
      });

      if (error) {
        throw error;
      }

      if (data && data.game_id) {
        setGameId(data.game_id);
        setCreateGameMessage(
          `Game created successfully! Game ID: ${data.game_id}`
        );
      } else {
        setCreateGameMessage("Game ID not found in response.");
        console.error("Response data from create-game:", data);
      }
    } catch (error) {
      console.error("Error creating game:", error);
      const message = error instanceof Error ? error.message : String(error);
      setCreateGameMessage(`Error creating game: ${message}`);
    } finally {
      setIsLoadingCreate(false);
    }
  };

  const handleInitializeGame = async () => {
    if (!gameId) {
      setInitGameMessage("No Game ID available to initialize.");
      return;
    }
    setIsLoadingInit(true);
    setInitGameMessage("");

    try {
      const { data, error } = await supabase.functions.invoke(
        "initialize-game-state",
        {
          body: { game_id: gameId },
        }
      );

      if (error) {
        throw error;
      }

      setInitGameMessage(
        data?.message || "Game initialized (no specific message)."
      );
      console.log("Initialize game response:", data);
    } catch (error) {
      console.error("Error initializing game:", error);
      const message = error instanceof Error ? error.message : String(error);
      setInitGameMessage(`Error initializing game: ${message}`);
    } finally {
      setIsLoadingInit(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Simplex TCG - Admin Test Page</h1>

      <section
        style={{
          marginBottom: "30px",
          padding: "15px",
          border: "1px solid #ccc",
        }}
      >
        <h2>Step 1: Create Game</h2>
        <div>
          <label htmlFor="opponentId" style={{ marginRight: "10px" }}>
            Opponent User ID:
          </label>
          <input
            type="text"
            id="opponentId"
            value={opponentUserId}
            onChange={(e) => setOpponentUserId(e.target.value)}
            placeholder="Enter opponent's user ID"
            style={{ padding: "8px", marginRight: "10px" }}
          />
          <button
            onClick={handleCreateGame}
            disabled={isLoadingCreate}
            style={{ padding: "8px 15px", cursor: "pointer" }}
          >
            {isLoadingCreate ? "Creating..." : "Create Game"}
          </button>
        </div>
        {createGameMessage && (
          <p
            style={{
              marginTop: "10px",
              color: createGameMessage.startsWith("Error") ? "red" : "green",
            }}
          >
            {createGameMessage}
          </p>
        )}
      </section>

      {gameId && (
        <section style={{ padding: "15px", border: "1px solid #ccc" }}>
          <h2>Step 2: Initialize Game State</h2>
          <p>
            Game ID: <strong>{gameId}</strong>
          </p>
          <button
            onClick={handleInitializeGame}
            disabled={isLoadingInit || !gameId}
            style={{
              padding: "8px 15px",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            {isLoadingInit ? "Initializing..." : "Initialize Game"}
          </button>
          {initGameMessage && (
            <p
              style={{
                marginTop: "10px",
                color: initGameMessage.startsWith("Error") ? "red" : "green",
              }}
            >
              {initGameMessage}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
