import { useState, useCallback, useEffect } from 'react';
import type { GameMap, MapCell } from '../../types/mapTypes';
import type { PlayerPosition } from '../../types/gameTypes';

interface UsePlayerMovementProps {
  initialPosition: PlayerPosition;
  gameMap: GameMap | undefined;
}

export function usePlayerMovement({
  initialPosition,
  gameMap,
}: UsePlayerMovementProps) {
  const [position, setPosition] = useState<PlayerPosition>(initialPosition);

  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition]);

  const canMoveTo = useCallback(
    (x: number, y: number): boolean => {
      if (!gameMap || !gameMap.grid) return false;
      if (y < 0 || y >= gameMap.height || x < 0 || x >= gameMap.width) {
        return false; // Out of bounds
      }
      const targetCell: MapCell | undefined = gameMap.grid[y]?.[x];
      return targetCell?.walkable || false;
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

  const teleportTo = useCallback(
    (x: number, y: number) => {
      if (
        gameMap &&
        y >= 0 &&
        y < gameMap.height &&
        x >= 0 &&
        x < gameMap.width
      ) {
        setPosition({ x, y });
      } else if (!gameMap) {
        setPosition({ x, y });
      }
    },
    [gameMap],
  );

  return {
    position,
    setPosition,
    move,
    teleportTo,
    canMoveTo,
  };
}
