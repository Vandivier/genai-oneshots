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
const PLAYER_VISIBILITY_RADIUS = 5;

function AppComponent() {
  const { state, dispatch } = useContext(AppContext);
  const {
    currentScreen,
    currentMap,
    player,
    currentPosition,
    previousLocation,
    isLoadingMap,
    fogData,
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

  useEffect(() => {
    if (currentMap && player && !isLoadingMap) {
      dispatch({
        type: 'INITIALIZE_OR_UPDATE_FOG',
        payload: {
          mapId: currentMap.id,
          mapWidth: currentMap.width,
          mapHeight: currentMap.height,
          playerPosition: playerPositionFromHook,
          visibilityRadius: PLAYER_VISIBILITY_RADIUS,
        },
      });
    }
  }, [currentMap, player, isLoadingMap, playerPositionFromHook, dispatch]);

  const initializeNewGame = useCallback(async () => {
    if (isLoadingMap) return;
    dispatch({ type: 'START_NEW_GAME_INIT' });
    await new Promise((resolve) => setTimeout(resolve, 0));
    const newGameSeed = `testseed_new_game_${Date.now()}`;
    const map = getMap(INITIAL_MAP_ID, newGameSeed);

    if (map) {
      let startPos = INITIAL_PLAYER_POSITION;
      if (!map.grid[startPos.y]?.[startPos.x]?.walkable) {
        console.warn(`Initial position not walkable, finding new...`);
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
        if (!foundWalkable) startPos = { x: 0, y: 0 };
      }
      dispatch({
        type: 'INITIALIZE_GAME_SUCCESS',
        payload: { map, position: startPos },
      });
      setPositionInHook(startPos);
    } else {
      console.error(`Failed to load map: ${INITIAL_MAP_ID}`);
      dispatch({
        type: 'INITIALIZE_GAME_FAILURE',
        payload: { error: `Failed to load map` },
      });
    }
  }, [isLoadingMap, dispatch, setPositionInHook]);

  const handlePlayerMove = useCallback(
    (dx: number, dy: number) => {
      if (!currentMap || !player || isLoadingMap) return;

      const targetX = playerPositionFromHook.x + dx;
      const targetY = playerPositionFromHook.y + dy;

      if (canMoveTo(targetX, targetY)) {
        dispatch({
          type: 'ADVANCE_FOG_TURNS',
          payload: { mapId: currentMap.id },
        });
        move(dx, dy);
      }
    },
    [
      currentMap,
      player,
      isLoadingMap,
      playerPositionFromHook,
      canMoveTo,
      move,
      dispatch,
    ],
  );

  useEffect(() => {
    if (isLoadingMap || !currentMap || !currentMap.grid || !player) return;
    const cell =
      currentMap.grid[playerPositionFromHook.y]?.[playerPositionFromHook.x];

    if (cell?.leadsTo) {
      const { mapId: newMapIdFromCell, targetX, targetY } = cell.leadsTo;
      dispatch({ type: 'TRANSITION_MAP_INIT' });

      if (newMapIdFromCell === PREVIOUS_MAP_SENTINEL) {
        if (previousLocation) {
          const oldMap = getMap(
            previousLocation.mapId,
            `${previousLocation.mapId}_seed`,
          );
          if (oldMap) {
            dispatch({ type: 'CLEAR_PREVIOUS_LOCATION' });
            dispatch({
              type: 'TRANSITION_MAP_SUCCESS',
              payload: {
                map: oldMap,
                position: { x: previousLocation.x, y: previousLocation.y },
              },
            });
            setPositionInHook({ x: previousLocation.x, y: previousLocation.y });
          } else {
            console.error(
              `Failed to load previous map: ${previousLocation.mapId}`,
            );
            dispatch({
              type: 'TRANSITION_MAP_FAILURE',
              payload: { error: `Prev map fail` },
            });
            initializeNewGame();
          }
        } else {
          console.error('No previousLocation for PREVIOUS_MAP_SENTINEL');
          dispatch({
            type: 'TRANSITION_MAP_FAILURE',
            payload: { error: 'No prev loc' },
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
          console.error(`Failed to load new map: ${newMapIdFromCell}`);
          dispatch({
            type: 'TRANSITION_MAP_FAILURE',
            payload: { error: `New map fail` },
          });
          if (currentMap.id !== newMapIdFromCell)
            dispatch({ type: 'CLEAR_PREVIOUS_LOCATION' });
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
    player,
  ]);

  useEffect(() => {
    if (currentScreen !== 'GameScreen' || isLoadingMap) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      let dx = 0,
        dy = 0;
      switch (event.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          dy = -1;
          break;
        case 's':
        case 'arrowdown':
          dy = 1;
          break;
        case 'a':
        case 'arrowleft':
          dx = -1;
          break;
        case 'd':
        case 'arrowright':
          dx = 1;
          break;
        default:
          return;
      }
      if (dx !== 0 || dy !== 0) {
        handlePlayerMove(dx, dy);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayerMove, currentScreen, isLoadingMap]);

  if (currentScreen === 'MainMenu') {
    return <MainMenu onNewGame={initializeNewGame} />;
  }

  if (currentScreen === 'GameScreen') {
    if (
      isLoadingMap ||
      !currentMap ||
      !currentMap.grid ||
      !player ||
      !fogData[currentMap.id]
    ) {
      return (
        <div className="App-container">
          Loading game world, player, or fog data...
        </div>
      );
    }
    const currentMapFog = fogData[currentMap.id];
    if (!currentMapFog) {
      return (
        <div className="App-container">
          Error: Fog data missing unexpectedly.
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
                fogMap={currentMapFog}
              />
            )}
          </div>
          <div className="controls-area">
            <MovementControls onMove={handlePlayerMove} />
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
            </div>
          </div>
        </main>
      </div>
    );
  }

  return <div className="App-container">Error: Unknown application state.</div>;
}

function App() {
  return (
    <AppProvider>
      <AppComponent />
    </AppProvider>
  );
}

export default App;
