import { useState, useEffect, useCallback } from 'react';
import './App.css';
import MapDisplay from './components/world/MapDisplay';
import MovementControls from './components/world/MovementControls';
import { usePlayerMovement } from './features/player/usePlayerMovement';
import type { PlayerPosition } from './types/gameTypes';
import { getMap } from './core/map/mapManager';
import type { GameMap } from './types/mapTypes';
import { PREVIOUS_MAP_SENTINEL } from './types/mapTypes';
import type { PlayerCharacter } from './types/characterTypes';
import MainMenu from './components/menu/MainMenu';

// Screen states
type Screen = 'MainMenu' | 'GameScreen';

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
  const [currentScreen, setCurrentScreen] = useState<Screen>('MainMenu');
  const [currentMap, setCurrentMap] = useState<GameMap | undefined>(undefined);
  const [player, setPlayer] = useState<PlayerCharacter>(initialPlayer);
  const [currentPosition, setCurrentPosition] = useState<PlayerPosition>(
    INITIAL_PLAYER_POSITION,
  );
  // Store previous location for return trips from interiors
  const [previousLocation, setPreviousLocation] = useState<{
    mapId: string;
    x: number;
    y: number;
  } | null>(null);

  const {
    position: playerPosition,
    move,
    canMoveTo,
    setPosition,
  } = usePlayerMovement({
    initialPosition: currentPosition,
    gameMap: currentMap,
  });

  const initializeNewGame = useCallback(() => {
    const newGameSeed = `testseed_new_game_${Date.now()}`;
    const map = getMap(INITIAL_MAP_ID, newGameSeed);
    if (map) {
      setCurrentMap(map);
      setPlayer(initialPlayer);
      setPreviousLocation(null); // Reset previous location on new game

      let startPos = INITIAL_PLAYER_POSITION;
      if (!map.grid[startPos.y]?.[startPos.x]?.walkable) {
        let foundWalkable = false;
        for (let r = 0; r < map.height; r++) {
          for (let c = 0; c < map.width; c++) {
            if (map.grid[r][c].walkable) {
              startPos = { x: c, y: r };
              foundWalkable = true;
              break;
            }
          }
          if (foundWalkable) break;
        }
        if (!foundWalkable) {
          console.error('No walkable tiles found for new game!');
          startPos = { x: 0, y: 0 };
        }
      }
      setCurrentPosition(startPos);
      setPosition(startPos);
      setCurrentScreen('GameScreen');
    } else {
      console.error(`Failed to load map for new game: ${INITIAL_MAP_ID}`);
    }
  }, [setPosition, setPreviousLocation]); // Added setPreviousLocation to dependency array

  // Effect to handle map transitions when player moves
  useEffect(() => {
    if (!currentMap || !currentMap.grid) return;

    const cell = currentMap.grid[playerPosition.y]?.[playerPosition.x];
    if (cell?.leadsTo) {
      const { mapId: newMapIdFromCell, targetX, targetY } = cell.leadsTo;

      if (newMapIdFromCell === PREVIOUS_MAP_SENTINEL) {
        if (previousLocation) {
          const oldMap = getMap(
            previousLocation.mapId,
            `${previousLocation.mapId}_seed`,
          );
          if (oldMap) {
            setCurrentMap(oldMap);
            setCurrentPosition({
              x: previousLocation.x,
              y: previousLocation.y,
            });
            setPosition({ x: previousLocation.x, y: previousLocation.y });
            setPreviousLocation(null);
          } else {
            console.error(
              `Failed to load previous map: ${previousLocation.mapId}. Returning to initial map.`,
            );
            initializeNewGame();
          }
        } else {
          console.error(
            'Attempted to return to previous map, but no previousLocation was set. Returning to initial map.',
          );
          initializeNewGame();
        }
      } else {
        if (currentMap.id !== newMapIdFromCell) {
          setPreviousLocation({
            mapId: currentMap.id,
            x: playerPosition.x,
            y: playerPosition.y,
          });
        }

        const newMap = getMap(newMapIdFromCell, `${newMapIdFromCell}_seed`);

        if (newMap) {
          setCurrentMap(newMap);
          setCurrentPosition({ x: targetX, y: targetY });
          setPosition({ x: targetX, y: targetY });
        } else {
          console.error(`Failed to load map: ${newMapIdFromCell}`);
        }
      }
    }
  }, [
    playerPosition,
    currentMap,
    setPosition,
    previousLocation,
    initializeNewGame,
    setPreviousLocation,
  ]);

  useEffect(() => {
    if (currentScreen === 'GameScreen' && !currentMap) {
      console.warn(
        'Entered GameScreen without a map. Initializing new game as fallback.',
      );
      initializeNewGame();
    }
  }, [currentScreen, currentMap, initializeNewGame]);

  useEffect(() => {
    if (currentScreen !== 'GameScreen') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          move(0, -1);
          break;
        case 's':
        case 'arrowdown':
          move(0, 1);
          break;
        case 'a':
        case 'arrowleft':
          move(-1, 0);
          break;
        case 'd':
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
  }, [move, currentScreen]);

  if (currentScreen === 'MainMenu') {
    return <MainMenu onNewGame={initializeNewGame} />;
  }

  if (currentScreen === 'GameScreen') {
    if (!currentMap || !currentMap.grid || !player) {
      return (
        <div className="App-container">
          Loading game world or player data...
        </div>
      );
    }

    const currentTile = currentMap.grid[playerPosition.y]?.[playerPosition.x];

    return (
      <div className="App-container">
        <header className="App-header">
          <h1>King Bananu - The Game</h1>
          <button
            onClick={() => setCurrentScreen('MainMenu')}
            style={{ position: 'absolute', top: '10px', right: '10px' }}
          >
            Menu
          </button>
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
                  <p>Walkable: {currentTile.walkable ? 'Yes' : 'No'}</p>
                  {currentTile.leadsTo && (
                    <p style={{ color: 'cyan' }}>
                      Leads to: {currentTile.leadsTo.mapId} at (
                      {currentTile.leadsTo.targetX},
                      {currentTile.leadsTo.targetY})
                    </p>
                  )}
                </>
              )}
              <p>
                Can move Right:{' '}
                {canMoveTo(playerPosition.x + 1, playerPosition.y)
                  ? 'Yes'
                  : 'No'}
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return <div className="App-container">Error: Unknown screen state.</div>;
}

export default App;
