import React, { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { DungeonScene } from "../scenes/DungeonScene";
import { CombatScene } from "../scenes/CombatScene";
import { Button } from "./ui/button";
import { Volume2, VolumeX } from "lucide-react";

export function GameBoard() {
  const gameRef = useRef<HTMLDivElement>(null);
  const [game, setGame] = useState<Phaser.Game | null>(null);
  const [isMuted, setIsMuted] = useState(
    () => localStorage.getItem("isMuted") === "true"
  );

  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameRef.current,
      width: 800,
      height: 600,
      backgroundColor: "#000000",
      scene: [DungeonScene, CombatScene],
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

    return () => {
      newGame.destroy(true);
    };
  }, []);

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    localStorage.setItem("isMuted", newMutedState.toString());

    if (game) {
      // Set mute state on the game instance
      game.sound.setMute(newMutedState);
      // Emit mute event to all scenes
      game.events.emit("mute", newMutedState);
    }
  };

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
