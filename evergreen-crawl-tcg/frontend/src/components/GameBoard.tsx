import { useRef, useState, useEffect } from "react";
import Phaser from "phaser";
import { createGameConfig } from "../config/game";
import { Button } from "./ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { SetupScreen } from "./SetupScreen";
import { gameAPI } from "../services/api";

export function GameBoard() {
  const [game, setGame] = useState<Phaser.Game | null>(null);
  const [isMuted, setIsMuted] = useState(
    () => localStorage.getItem("isMuted") === "true"
  );
  const [playerId, setPlayerId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGameStart = async (newPlayerId: number) => {
    try {
      setPlayerId(newPlayerId);

      // Start a new dungeon instance
      console.log("Starting new dungeon instance...");
      await gameAPI.startDungeon(newPlayerId);
      console.log("Dungeon instance created");

      // Initialize the game with Phaser
      const config = createGameConfig(newPlayerId);
      const newGame = new Phaser.Game(config);

      // Apply initial mute state
      newGame.sound.setMute(isMuted);

      // Handle dungeon errors
      newGame.events.on("dungeonError", (error: Error) => {
        console.error("Dungeon error:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to initialize dungeon"
        );
        setPlayerId(null);
      });

      setGame(newGame);
    } catch (err) {
      console.error("Failed to start game:", err);
      setError(err instanceof Error ? err.message : "Failed to start game");
      setPlayerId(null);
    }
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    localStorage.setItem("isMuted", newMutedState.toString());

    if (game) {
      game.sound.setMute(newMutedState);
      game.events.emit("mute", newMutedState);
    }
  };

  // Clean up game instance on unmount
  useEffect(() => {
    return () => {
      if (game) {
        game.destroy(true);
      }
    };
  }, [game]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!playerId) {
    return <SetupScreen onGameStart={handleGameStart} />;
  }

  return (
    <div className="relative w-full h-full">
      <div id="game-container" className="w-full h-full" />
      <div className="absolute top-4 right-4 z-50">
        <Button
          variant="secondary"
          size="icon"
          onClick={toggleMute}
          className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700"
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4 text-gray-200" />
          ) : (
            <Volume2 className="h-4 w-4 text-gray-200" />
          )}
        </Button>
      </div>
    </div>
  );
}
