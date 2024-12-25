import { useRef, useState, useEffect } from "react";
import Phaser from "phaser";
import { DungeonScene } from "../scenes/dungeon/DungeonScene";
import { CombatScene } from "../scenes/CombatScene";
import { Button } from "./ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { SetupScreen } from "./SetupScreen";

export function GameBoard() {
  const gameRef = useRef<HTMLDivElement>(null);
  const [game, setGame] = useState<Phaser.Game | null>(null);
  const [isMuted, setIsMuted] = useState(
    () => localStorage.getItem("isMuted") === "true"
  );
  const [playerId, setPlayerId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGameStart = async (newPlayerId: number) => {
    setPlayerId(newPlayerId);
    await initializeGame(newPlayerId);
  };

  const initializeGame = async (currentPlayerId: number) => {
    try {
      if (!gameRef.current) return;

      // Destroy existing game instance if it exists
      if (game) {
        game.destroy(true);
      }

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: gameRef.current,
        width: 800,
        height: 600,
        backgroundColor: "#000000",
        scene: [new DungeonScene({ playerId: currentPlayerId }), CombatScene],
        physics: {
          default: "arcade",
          arcade: {
            gravity: { x: 0, y: 0 },
            debug: false,
          },
        },
        audio: {
          disableWebAudio: false,
        },
      };

      const newGame = new Phaser.Game(config);
      setGame(newGame);

      // Apply initial mute state
      const initialMuted = localStorage.getItem("isMuted") === "true";
      newGame.sound.setMute(initialMuted);

      // Handle dungeon errors
      newGame.events.on("dungeonError", (error: Error) => {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to initialize dungeon"
        );
        setPlayerId(null);
      });

      return () => {
        newGame.destroy(true);
      };
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to initialize game"
      );
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
      <div ref={gameRef} className="w-full h-full" />
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
