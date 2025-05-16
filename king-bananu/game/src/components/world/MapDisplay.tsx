import React, { useRef, useEffect } from 'react';
import type { GameMap, MapCell } from '../../types/mapTypes';
import type { PlayerCharacter } from '../../types/characterTypes';

interface MapDisplayProps {
  gameMap: GameMap;
  player: PlayerCharacter;
  playerPosition: { x: number; y: number };
}

const TILE_SIZE = 32; // pixels

// Define max dimensions for the scrollable map viewport
const MAP_VIEWPORT_MAX_WIDTH = '80vw'; // e.g., 80% of viewport width
const MAP_VIEWPORT_MAX_HEIGHT = '70vh'; // e.g., 70% of viewport height

interface TileDisplay {
  backgroundColor: string;
  emoji?: string;
}

const getTileDisplay = (cell: MapCell): TileDisplay => {
  // Default display
  let display: TileDisplay = { backgroundColor: '#ECF0F1' }; // Off-white for unknown

  switch (cell.terrain) {
    case 'grass':
      display = { backgroundColor: '#2ECC71', emoji: '' }; // Green
      break;
    case 'forest':
      display = { backgroundColor: '#27AE60', emoji: '🌲' }; // Darker Green
      break;
    case 'water':
      display = { backgroundColor: '#3498DB', emoji: '💧' }; // Blue
      break;
    case 'mountain':
      display = { backgroundColor: '#7F8C8D', emoji: '⛰️' }; // Grey
      break;
    case 'town_floor':
      display = { backgroundColor: '#BDC3C7' }; // Light Grey (Pavement)
      break;
    case 'building_wall':
      display = { backgroundColor: '#A93226', emoji: '🧱' }; // Brick Red
      break;
    case 'building_door':
      display = { backgroundColor: '#D35400', emoji: '🚪' }; // Orange/Brown (Door)
      break;
    case 'road':
      display = { backgroundColor: '#B2BABB' }; // Lighter Grey for roads
      break;
    case 'empty':
      display = { backgroundColor: '#566573' }; // Color for empty interior spaces
      break;
    default:
      display = { backgroundColor: '#ECF0F1' }; // Off-white for unknown
      break;
  }

  // Override emoji for NPC
  if (cell.interaction?.type === 'npc') {
    display.emoji = '🧑'; // Generic person emoji
  }

  return display;
};

const MapDisplay: React.FC<MapDisplayProps> = ({
  gameMap,
  player,
  playerPosition,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Guard against undefined playerPosition, though props should ensure it exists now
    if (
      scrollContainerRef.current &&
      playerPosition &&
      gameMap &&
      gameMap.grid
    ) {
      // gameMap.grid
      const container = scrollContainerRef.current;
      const playerVisualCenterX = playerPosition.x * TILE_SIZE + TILE_SIZE / 2;
      const playerVisualCenterY = playerPosition.y * TILE_SIZE + TILE_SIZE / 2;
      const targetScrollLeft = playerVisualCenterX - container.offsetWidth / 2;
      const targetScrollTop = playerVisualCenterY - container.offsetHeight / 2;
      try {
        container.scrollTo({
          left: targetScrollLeft,
          top: targetScrollTop,
          behavior: 'smooth',
        });
      } catch {
        // Fallback for older browsers or if scrollTo options fail, variable _error removed
        container.scrollLeft = targetScrollLeft;
        container.scrollTop = targetScrollTop;
      }
    }
  }, [playerPosition, gameMap]); // gameMap dependency implies gameMap.grid as well

  // Guards for gameMap and player should ideally be in the parent (AppComponent)
  // but keeping a fallback here just in case, though it shouldn't be hit if props are mandatory.
  if (!gameMap || !gameMap.grid || !player || !playerPosition) {
    console.error(
      '[MapDisplay.tsx] Critical props missing, rendering fallback. This should not happen if parent guards props.',
      { gameMap, player, playerPosition },
    );
    return <div>Error: Essential map or player data missing.</div>;
  }

  const mapTotalWidth = gameMap.width * TILE_SIZE;
  const mapTotalHeight = gameMap.height * TILE_SIZE;

  return (
    <div
      ref={scrollContainerRef}
      style={{
        maxWidth: MAP_VIEWPORT_MAX_WIDTH,
        maxHeight: MAP_VIEWPORT_MAX_HEIGHT,
        width: `${mapTotalWidth}px`,
        height: `${mapTotalHeight}px`,
        overflow: 'auto',
        border: '2px solid #555',
        position: 'relative',
        backgroundColor: '#333',
      }}
      className="map-scroll-container"
    >
      {gameMap.grid.map(
        (
          row: MapCell[],
          y: number, // Changed from gameMap.cells
        ) =>
          row.map((cell: MapCell, x: number) => {
            const tileDisplay = getTileDisplay(cell);
            return (
              <div
                key={`${x}-${y}`}
                style={{
                  position: 'absolute',
                  left: x * TILE_SIZE,
                  top: y * TILE_SIZE,
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  backgroundColor: tileDisplay.backgroundColor,
                  border: '1px solid #444',
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: TILE_SIZE * 0.6, // Adjust emoji size relative to tile size
                }}
              >
                {tileDisplay.emoji}
              </div>
            );
          }),
      )}
      {/* Player rendering (already checks for player and playerPosition) */}
      <div
        style={{
          position: 'absolute',
          left: playerPosition.x * TILE_SIZE + TILE_SIZE / 4,
          top: playerPosition.y * TILE_SIZE + TILE_SIZE / 4,
          width: TILE_SIZE / 2,
          height: TILE_SIZE / 2,
          backgroundColor: 'red',
          borderRadius: '50%',
          zIndex: 10,
          transition: 'left 0.1s linear, top 0.1s linear',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: TILE_SIZE * 0.3, // Smaller emoji for player if needed
        }}
        title={player.name}
      >
        🦍 {/* Gorilla emoji for King Bananu */}
      </div>
    </div>
  );
};

export default MapDisplay;
