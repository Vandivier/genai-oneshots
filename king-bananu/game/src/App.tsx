import { useState, useEffect } from 'react';
import './App.css';
import MapDisplay from './components/world/MapDisplay';
import MovementControls from './components/world/MovementControls';
import { usePlayerMovement } from './features/player/usePlayerMovement';
import type { PlayerPosition } from './features/player/usePlayerMovement';
import { getMap } from './core/map/mapManager';
import type { GameMap } from './types/mapTypes';
import type { PlayerCharacter } from './types/characterTypes';

// Mock player data for now
const initialPlayer: PlayerCharacter = {
  id: 'player1',
  name: 'King Bananu',
  level: 1,
  currentHp: 100,
  maxHp: 100,
  attack: 15,
  defense: 10,
  speed: 5,
  abilities: [],
  experience: 0,
  experienceToNextLevel: 100,
};

const INITIAL_MAP_ID = 'worldmap_testseed';
const INITIAL_PLAYER_POSITION: PlayerPosition = { x: 5, y: 5 };

function App() {
  const [currentMap, setCurrentMap] = useState<GameMap | undefined>(undefined);
  const [player] = useState<PlayerCharacter>(initialPlayer); // Player data is static for now

  const {
    position: playerPosition,
    move,
    moveTo,
    canMoveTo,
  } = usePlayerMovement({
    initialPosition: INITIAL_PLAYER_POSITION,
    gameMap: currentMap,
  });

  // Load initial map
  useEffect(() => {
    const map = getMap(INITIAL_MAP_ID, 'testseed'); // Use the seed from mapId or a fixed one
    if (map) {
      setCurrentMap(map);
      // Ensure player starts within bounds and on a walkable tile if possible
      if (
        !map.cells[INITIAL_PLAYER_POSITION.y]?.[INITIAL_PLAYER_POSITION.x]
          ?.isWalkable
      ) {
        // Find first walkable tile as a fallback
        let foundWalkable = false;
        for (let r = 0; r < map.height; r++) {
          for (let c = 0; c < map.width; c++) {
            if (map.cells[r][c].isWalkable) {
              moveTo(c, r);
              foundWalkable = true;
              break;
            }
          }
          if (foundWalkable) break;
        }
        if (!foundWalkable) {
          console.error('No walkable tiles found on initial map!');
          // Fallback to initialPosition if no walkable tile is found, though it might be non-walkable
          moveTo(INITIAL_PLAYER_POSITION.x, INITIAL_PLAYER_POSITION.y);
        }
      } else {
        // If initial position is walkable, ensure the hook's state reflects it
        // (initialPosition in usePlayerMovement already sets it, but moveTo is safer if map loads late)
        moveTo(INITIAL_PLAYER_POSITION.x, INITIAL_PLAYER_POSITION.y);
      }
    } else {
      console.error(`Failed to load map: ${INITIAL_MAP_ID}`);
    }
  }, [moveTo]); // Added moveTo to dependencies of useEffect

  // Keyboard movement handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case 'w': // Up
        case 'arrowup':
          move(0, -1);
          break;
        case 's': // Down
        case 'arrowdown':
          move(0, 1);
          break;
        case 'a': // Left
        case 'arrowleft':
          move(-1, 0);
          break;
        case 'd': // Right
        case 'arrowright':
          move(1, 0);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [move]);

  if (!currentMap || !currentMap.cells) {
    return <div className="App-container">Loading game world...</div>;
  }

  // Ensure playerPosition is valid before rendering tile info
  const currentTile = currentMap.cells[playerPosition.y]?.[playerPosition.x];

  return (
    <div className="App-container">
      <header className="App-header">
        <h1>King Bananu - The Game</h1>
      </header>
      <main className="App-main">
        <div className="game-area">
          <MapDisplay
            gameMap={currentMap}
            player={player}
            playerPosition={playerPosition}
          />
        </div>
        <div className="controls-area">
          <MovementControls onMove={move} />
          <div className="player-info">
            <p>
              Player: {player.name} (Lvl {player.level})
            </p>
            <p>
              Position: ({playerPosition.x}, {playerPosition.y})
            </p>
            {currentTile && (
              <>
                <p>Current Tile: {currentTile.terrain}</p>
                <p>Walkable: {currentTile.isWalkable ? 'Yes' : 'No'}</p>
              </>
            )}
            {/* For debugging movement logic: */}
            <p>
              Can move Right:{' '}
              {canMoveTo(playerPosition.x + 1, playerPosition.y) ? 'Yes' : 'No'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
