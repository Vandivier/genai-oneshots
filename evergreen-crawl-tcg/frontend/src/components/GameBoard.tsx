import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import { gameConfig } from "../config/game";

export const GameBoard: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && !gameRef.current) {
      // Initialize the game with the container
      gameRef.current = new Phaser.Game({
        ...gameConfig,
        parent: containerRef.current,
      });
    }

    // Cleanup on unmount
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="game-container"
      className="w-full h-full min-h-[600px] bg-gray-800"
    />
  );
};
