import React from 'react';
import type { GameMap, MapCell } from '../../types/mapTypes';
import type { PlayerCharacter } from '../../types/characterTypes';

interface MapDisplayProps {
  gameMap: GameMap;
  player?: PlayerCharacter; // Optional player for rendering on map
  playerPosition?: { x: number; y: number }; // Optional player position
}

const TILE_SIZE = 32; // pixels

const getTileColor = (terrain: MapCell['terrain']): string => {
  switch (terrain) {
    case 'grass':
      return 'green';
    case 'forest':
      return 'darkgreen';
    case 'water':
      return 'blue';
    case 'mountain':
      return 'grey';
    case 'town_floor':
      return 'lightgrey';
    case 'dungeon_wall':
      return 'black';
    case 'dungeon_floor':
      return 'darkgrey';
    default:
      return 'white';
  }
};

const MapDisplay: React.FC<MapDisplayProps> = ({
  gameMap,
  player,
  playerPosition,
}) => {
  if (!gameMap || !gameMap.cells) {
    return <div>Loading map...</div>;
  }

  return (
    <div
      style={{
        position: 'relative',
        width: gameMap.width * TILE_SIZE,
        height: gameMap.height * TILE_SIZE,
        border: '1px solid black',
        backgroundColor: '#333',
      }}
    >
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
              border: '1px solid #444', // Cell border
              boxSizing: 'border-box',
            }}
          >
            {/* Optionally render cell info, like coordinates for debugging */}
            {/* {`(${x},${y})`} */}
          </div>
        )),
      )}
      {player && playerPosition && (
        <div
          style={{
            position: 'absolute',
            left: playerPosition.x * TILE_SIZE + TILE_SIZE / 4, // Center player a bit
            top: playerPosition.y * TILE_SIZE + TILE_SIZE / 4,
            width: TILE_SIZE / 2,
            height: TILE_SIZE / 2,
            backgroundColor: 'red', // Player representation
            borderRadius: '50%',
            zIndex: 10,
          }}
          title={player.name}
        />
      )}
    </div>
  );
};

export default MapDisplay;
