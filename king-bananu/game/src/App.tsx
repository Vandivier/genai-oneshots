import { useEffect, useCallback, useContext } from 'react';
import './App.css';
import MapDisplay from './components/world/MapDisplay';
import MovementControls from './components/world/MovementControls';
import { usePlayerMovement } from './features/player/usePlayerMovement';
import { getMap } from './core/map/mapManager';
import { PREVIOUS_MAP_SENTINEL } from './types/mapTypes';
import MainMenu from './components/menu/MainMenu';
import { AppContext, AppProvider } from './context/AppContext';
import type { PlayerPosition } from './types/gameTypes';

const INITIAL_MAP_ID = 'worldmap_testseed';
const INITIAL_PLAYER_POSITION: PlayerPosition = { x: 5, y: 5 };

function AppComponent() {
  const { state, dispatch } = useContext(AppContext);
  const {
    currentScreen,
    currentMap,
    player,
    currentPosition,
    previousLocation,
    isLoadingMap,
  } = state;

  const {
    position: playerPositionFromHook,
    move,
    canMoveTo,
    setPosition: setPositionInHook,
  } = usePlayerMovement({
    initialPosition: currentPosition,
    gameMap: currentMap,
  });

  const initializeNewGame = useCallback(async () => {
    if (isLoadingMap) {
      return;
    }
    dispatch({ type: 'START_NEW_GAME_INIT' });

    await new Promise((resolve) => setTimeout(resolve, 0));

    const newGameSeed = `testseed_new_game_${Date.now()}`;
    const map = getMap(INITIAL_MAP_ID, newGameSeed);

    if (map) {
      let startPos = INITIAL_PLAYER_POSITION;
      if (!map.grid[startPos.y]?.[startPos.x]?.walkable) {
        console.warn(
          `[App.tsx] Initial position (${startPos.x}, ${startPos.y}) is not walkable. Searching for a walkable tile...`,
        );
        let foundWalkable = false;
        for (let r = 0; r < map.height; r++) {
          for (let c = 0; c < map.width; c++) {
            if (map.grid[r][c].walkable) {
              startPos = { x: c, y: r };
              console.log(
                `[App.tsx] Found walkable starting tile at (${startPos.x}, ${startPos.y}).`,
              );
              foundWalkable = true;
              break;
            }
          }
          if (foundWalkable) break;
        }
        if (!foundWalkable) {
          console.error(
            `[App.tsx] No walkable tile found on map ${map.id}. Defaulting to (0,0). This may cause issues.`,
          );
          startPos = { x: 0, y: 0 };
        }
      }
      dispatch({
        type: 'INITIALIZE_GAME_SUCCESS',
        payload: { map, position: startPos },
      });
      setPositionInHook(startPos);
    } else {
      console.error(
        `[App.tsx] initializeNewGame: Failed to load map. Dispatching INITIALIZE_GAME_FAILURE`,
      );
      dispatch({
        type: 'INITIALIZE_GAME_FAILURE',
        payload: { error: `Failed to load map: ${INITIAL_MAP_ID}` },
      });
    }
  }, [isLoadingMap, dispatch, setPositionInHook]);

  useEffect(() => {
    if (isLoadingMap || !currentMap || !currentMap.grid) return;

    const cell =
      currentMap.grid[playerPositionFromHook.y]?.[playerPositionFromHook.x];

    if (cell?.leadsTo) {
      const { mapId: newMapIdFromCell, targetX, targetY } = cell.leadsTo;
      dispatch({ type: 'TRANSITION_MAP_INIT' });

      if (newMapIdFromCell === PREVIOUS_MAP_SENTINEL) {
        if (previousLocation) {
          const oldMapId = previousLocation.mapId;
          const oldPlayerX = previousLocation.x;
          const oldPlayerY = previousLocation.y;

          dispatch({ type: 'CLEAR_PREVIOUS_LOCATION' });
          const oldMap = getMap(oldMapId, `${oldMapId}_seed`);

          if (oldMap) {
            dispatch({
              type: 'TRANSITION_MAP_SUCCESS',
              payload: {
                map: oldMap,
                position: { x: oldPlayerX, y: oldPlayerY },
              },
            });
            setPositionInHook({ x: oldPlayerX, y: oldPlayerY });
          } else {
            console.error(
              `[App.tsx] Failed to load previous map: ${oldMapId}. Returning to new game screen.`,
            );
            dispatch({
              type: 'TRANSITION_MAP_FAILURE',
              payload: { error: `Failed to load previous map: ${oldMapId}` },
            });
            initializeNewGame();
          }
        } else {
          console.error(
            '[App.tsx] PREVIOUS_MAP_SENTINEL but no previousLocation! Re-initializing.',
          );
          dispatch({
            type: 'TRANSITION_MAP_FAILURE',
            payload: { error: 'No previous location for return.' },
          });
          initializeNewGame();
        }
      } else {
        if (currentMap.id !== newMapIdFromCell) {
          dispatch({
            type: 'SET_PREVIOUS_LOCATION',
            payload: {
              mapId: currentMap.id,
              x: playerPositionFromHook.x,
              y: playerPositionFromHook.y,
            },
          });
        }
        const newMap = getMap(newMapIdFromCell, `${newMapIdFromCell}_seed`);
        if (newMap) {
          dispatch({
            type: 'TRANSITION_MAP_SUCCESS',
            payload: { map: newMap, position: { x: targetX, y: targetY } },
          });
          setPositionInHook({ x: targetX, y: targetY });
        } else {
          console.error(
            `[App.tsx] Failed to load new map: ${newMapIdFromCell}. Player remains on current map.`,
          );
          dispatch({
            type: 'TRANSITION_MAP_FAILURE',
            payload: { error: `Failed to load map: ${newMapIdFromCell}` },
          });
          if (currentMap.id !== newMapIdFromCell) {
            dispatch({ type: 'CLEAR_PREVIOUS_LOCATION' });
          }
        }
      }
    }
  }, [
    playerPositionFromHook,
    currentMap,
    isLoadingMap,
    dispatch,
    previousLocation,
    initializeNewGame,
    setPositionInHook,
  ]);

  useEffect(() => {
    if (currentScreen !== 'GameScreen' || isLoadingMap) return;
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
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move, currentScreen, isLoadingMap]);

  if (currentScreen === 'MainMenu') {
    return <MainMenu onNewGame={initializeNewGame} />;
  }

  if (currentScreen === 'GameScreen') {
    if (isLoadingMap || !currentMap || !currentMap.grid || !player) {
      return (
        <div className="App-container">
          Loading game world or player data...
        </div>
      );
    }

    const currentTile =
      currentMap.grid[playerPositionFromHook.y]?.[playerPositionFromHook.x];

    return (
      <div className="App-container">
        <header className="App-header">
          <h1>King Bananu - The Game</h1>
          <button
            onClick={() => dispatch({ type: 'RETURN_TO_MAIN_MENU' })}
            style={{ position: 'absolute', top: '10px', right: '10px' }}
          >
            Menu
          </button>
        </header>
        <main className="App-main">
          <div className="game-area">
            {player && (
              <MapDisplay
                key={`${currentMap.id}-${currentPosition.x}-${currentPosition.y}`}
                gameMap={currentMap}
                player={player}
                playerPosition={playerPositionFromHook}
              />
            )}
          </div>
          <div className="controls-area">
            <MovementControls onMove={move} />
            <div className="player-info">
              <p>
                Player: {player.name} (Lvl {player.level})
              </p>
              <p>
                Position: ({playerPositionFromHook.x},{' '}
                {playerPositionFromHook.y})
              </p>
              {currentTile && (
                <>
                  <p>Current Tile: {currentTile.terrain}</p>
                  <p>Walkable: {currentTile.walkable ? 'Yes' : 'No'}</p>
                  {currentTile.leadsTo && (
                    <p style={{ color: 'cyan' }}>
                      Leads to: {currentTile.leadsTo.mapId} at (
                      {currentTile.leadsTo.targetX},{' '}
                      {currentTile.leadsTo.targetY})
                    </p>
                  )}
                </>
              )}
              <p>
                Can move Right:{' '}
                {canMoveTo(
                  playerPositionFromHook.x + 1,
                  playerPositionFromHook.y,
                )
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

function App() {
  return (
    <AppProvider>
      <AppComponent />
    </AppProvider>
  );
}

export default App;
