import { useState, useCallback } from 'react';
import type { GameMap, MapCell } from '../../types/mapTypes';

export interface PlayerPosition {
  x: number;
  y: number;
}

interface UsePlayerMovementProps {
  initialPosition: PlayerPosition;
  gameMap: GameMap | undefined;
}

export function usePlayerMovement({
  initialPosition,
  gameMap,
}: UsePlayerMovementProps) {
  const [position, setPosition] = useState<PlayerPosition>(initialPosition);

  const canMoveTo = useCallback(
    (x: number, y: number): boolean => {
      if (!gameMap || !gameMap.cells) return false;
      if (y < 0 || y >= gameMap.height || x < 0 || x >= gameMap.width) {
        return false; // Out of bounds
      }
      const targetCell: MapCell | undefined = gameMap.cells[y]?.[x];
      return targetCell?.isWalkable || false;
    },
    [gameMap],
  );

  const move = useCallback(
    (dx: number, dy: number) => {
      setPosition((prevPosition) => {
        const newX = prevPosition.x + dx;
        const newY = prevPosition.y + dy;
        if (canMoveTo(newX, newY)) {
          // TODO: Consume movement energy here (Phase 4)
          // TODO: Trigger encounters or events based on new cell (Phase 3 & 5)
          return { x: newX, y: newY };
        }
        return prevPosition; // Stay in place if move is invalid
      });
    },
    [canMoveTo],
  );

  const moveTo = useCallback(
    (x: number, y: number) => {
      if (canMoveTo(x, y)) {
        setPosition({ x, y });
      }
    },
    [canMoveTo],
  );

  return {
    position,
    move,
    moveTo,
    canMoveTo,
  };
}
