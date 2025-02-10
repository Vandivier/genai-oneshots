"use client";

import { useEffect, useRef } from "react";

interface GameProps {
  playerName: string;
  onBack: () => void;
}

export default function Game({ playerName, onBack }: GameProps) {
  const gameRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<any>(null);

  useEffect(() => {
    let GameScene: any;
    let Phaser: any;

    const initGame = async () => {
      if (!gameRef.current) return;

      // Dynamically import Phaser and GameScene
      const [phaserModule, { default: Scene }] = await Promise.all([
        import("phaser"),
        import("../../phaser/GameScene"),
      ]);

      Phaser = phaserModule.default;
      GameScene = Scene;

      const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: gameRef.current,
        scene: [GameScene],
        physics: {
          default: "arcade",
          arcade: { gravity: { x: 0, y: 0 } },
        },
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
      };

      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
      }

      gameInstanceRef.current = new Phaser.Game(config);
      gameInstanceRef.current.scene.start("GameScene", { playerName });
    };

    initGame();

    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
      }
    };
  }, [playerName]);

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-4">Wizard Dude Game</h1>
      <p className="mb-4">Welcome, Wizard {playerName}!</p>
      <div ref={gameRef} style={{ width: "800px", height: "600px" }} />
      <button
        className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        onClick={onBack}
      >
        Back to Start
      </button>
    </div>
  );
}
