import React, { useRef, useEffect } from 'react';
import type { GameMap, MapCell } from '../../types/mapTypes';
import type { PlayerCharacter } from '../../types/characterTypes';

interface MapDisplayProps {
  gameMap: GameMap; // Changed: No longer undefined, guard this in parent
  player: PlayerCharacter; // Changed: No longer optional, guard this in parent
  playerPosition: { x: number; y: number }; // Changed: No longer optional
}

const TILE_SIZE = 32; // pixels

// Define max dimensions for the scrollable map viewport
const MAP_VIEWPORT_MAX_WIDTH = '80vw'; // e.g., 80% of viewport width
const MAP_VIEWPORT_MAX_HEIGHT = '70vh'; // e.g., 70% of viewport height

const getTileColor = (terrain: MapCell['terrain']): string => {
  switch (terrain) {
    case 'grass':
      return '#2ECC71'; // Green
    case 'forest':
      return '#27AE60'; // Darker Green
    case 'water':
      return '#3498DB'; // Blue
    case 'mountain':
      return '#7F8C8D'; // Grey
    case 'town_floor':
      return '#BDC3C7'; // Light Grey (Pavement)
    case 'building_wall':
      return '#A93226'; // Brick Red
    case 'building_door':
      return '#D35400'; // Orange/Brown (Door)
    case 'road':
      return '#B2BABB'; // Lighter Grey for roads
    case 'empty':
      return '#566573'; // Color for empty interior spaces
    default:
      return '#ECF0F1'; // Off-white for unknown
  }
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
          row.map((cell: MapCell, x: number) => (
            <div
              key={`${x}-${y}`}
              style={{
                position: 'absolute',
                left: x * TILE_SIZE,
                top: y * TILE_SIZE,
                width: TILE_SIZE,
                height: TILE_SIZE,
                backgroundColor: getTileColor(cell.terrain),
                border: '1px solid #444',
                boxSizing: 'border-box',
              }}
            >
              {/* Optional: cell content like (x,y) or terrain type for debug */}
            </div>
          )),
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
        }}
        title={player.name}
      />
    </div>
  );
};

export default MapDisplay;
