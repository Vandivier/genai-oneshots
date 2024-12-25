import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import { gameConfig } from "../config/game";

export const GameBoard: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && !gameRef.current) {
      gameRef.current = new Phaser.Game({
        ...gameConfig,
        parent: containerRef.current,
        width: 800,
        height: 600,
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          width: 800,
          height: 600,
        },
      });
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex justify-center items-center">
      <div
        ref={containerRef}
        id="game-container"
        className="w-[800px] h-[600px] bg-gray-800 relative"
        style={{ aspectRatio: "800/600" }}
      />
    </div>
  );
};
