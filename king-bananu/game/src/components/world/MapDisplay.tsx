import React, { useRef, useEffect } from 'react';
import type { GameMap, MapCell } from '../../types/mapTypes';
import type { PlayerCharacter } from '../../types/characterTypes';

interface MapDisplayProps {
  gameMap: GameMap | undefined; // Allow undefined for initial loading
  player?: PlayerCharacter; // Optional player for rendering on map
  playerPosition?: { x: number; y: number }; // Optional player position
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
    case 'dungeon_wall':
      return '#34495E'; // Dark Blue/Grey
    case 'dungeon_floor':
      return '#7F8C8D'; // Grey
    case 'building_wall':
      return '#A93226'; // Brick Red
    case 'building_door':
      return '#D35400'; // Orange/Brown (Door)
    case 'road':
      return '#B2BABB'; // Lighter Grey for roads
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
    if (
      scrollContainerRef.current &&
      playerPosition &&
      gameMap &&
      gameMap.cells
    ) {
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-empty
      } catch (_error) {
        // Fallback for older browsers that might not support the options object or smooth behavior
        container.scrollLeft = targetScrollLeft;
        container.scrollTop = targetScrollTop;
      }
    }
  }, [playerPosition, gameMap]);

  if (!gameMap || !gameMap.cells) {
    return <div>Loading map...</div>;
  }

  const mapTotalWidth = gameMap.width * TILE_SIZE;
  const mapTotalHeight = gameMap.height * TILE_SIZE;

  return (
    <div
      ref={scrollContainerRef}
      style={{
        maxWidth: MAP_VIEWPORT_MAX_WIDTH,
        maxHeight: MAP_VIEWPORT_MAX_HEIGHT,
        width: `${mapTotalWidth}px`, // Set a specific pixel width for the content area
        height: `${mapTotalHeight}px`, // Set a specific pixel height for the content area
        overflow: 'auto',
        border: '2px solid #555',
        position: 'relative', // Important for absolute positioning of children
        backgroundColor: '#333',
      }}
      className="map-scroll-container" // For potential global CSS targeting
    >
      {/* This inner div is purely for positioning child elements 
          if the parent's direct children were managed differently (e.g. display:flex on parent) 
          but here, tiles are positioned absolutely relative to scrollContainerRef anyway.
          We can simplify and remove this extra div. Tiles will be positioned relative to the scrollable div.
      */}
      {/* Tiles and player will be direct children of the scrollable div */}
      {gameMap.cells.map((row: MapCell[], y: number) =>
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
            {/* {`(${x},${y})`} */}
          </div>
        )),
      )}
      {player && playerPosition && (
        <div
          style={{
            position: 'absolute',
            left: playerPosition.x * TILE_SIZE + TILE_SIZE / 4, // Centering offset for player icon
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
      )}
    </div>
  );
};

export default MapDisplay;
