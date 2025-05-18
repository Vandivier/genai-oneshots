import { useEffect, useCallback, useContext, useRef } from 'react';
import './App.css';
import MapDisplay from './components/world/MapDisplay';
import MovementControls from './components/world/MovementControls';
import { usePlayerMovement } from './features/player/usePlayerMovement';
import { getMap } from './core/map/mapManager';
import {
  PREVIOUS_MAP_SENTINEL,
  PRIMARY_WORLD_MAP_ID,
  type MapCell,
} from './types/mapTypes';
import MainMenu from './components/menu/MainMenu';
import { AppContext, AppProvider } from './context/AppContext';
import type { PlayerPosition } from './types/gameTypes';

const INITIAL_PLAYER_POSITION: PlayerPosition = { x: 5, y: 5 };
const PLAYER_VISIBILITY_RADIUS = 5;

function AppComponent() {
  const { state, dispatch } = useContext(AppContext);
  const {
    currentScreen,
    gameSeed,
    currentMap,
    player,
    currentPosition,
    previousLocation,
    isLoadingMap,
    fogData,
    isDebugMode,
    isCellSelectionModeActive,
  } = state;

  const initialMapLoadAttemptedRef = useRef(false);

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
    if (currentMap && player && !isLoadingMap && playerPositionFromHook) {
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

  const initializeNewGame = useCallback(
    (seed?: string) => {
      if (isLoadingMap) return;
      initialMapLoadAttemptedRef.current = false;
      dispatch({ type: 'START_NEW_GAME_INIT', payload: { seed } });
    },
    [dispatch, isLoadingMap],
  );

  useEffect(() => {
    if (
      gameSeed &&
      currentScreen === 'GameScreen' &&
      isLoadingMap &&
      !currentMap &&
      !initialMapLoadAttemptedRef.current
    ) {
      initialMapLoadAttemptedRef.current = true;
      console.log(
        `[App] Attempting to load initial map with seed: ${gameSeed}`,
      );
      const map = getMap(PRIMARY_WORLD_MAP_ID, gameSeed);

      if (map) {
        let startPos = INITIAL_PLAYER_POSITION;
        if (!map.grid[startPos.y]?.[startPos.x]?.walkable) {
          console.warn(
            `[App] Initial position ${startPos.x},${startPos.y} not walkable, finding new...`,
          );
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
            console.error(
              `[App] No walkable cell found on map ${map.id}. Defaulting to 0,0.`,
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
          `[App] Failed to load initial map: ${PRIMARY_WORLD_MAP_ID} with seed: ${gameSeed}`,
        );
        dispatch({
          type: 'INITIALIZE_GAME_FAILURE',
          payload: { error: `Failed to load initial map` },
        });
      }
    }
  }, [
    gameSeed,
    currentScreen,
    isLoadingMap,
    currentMap,
    dispatch,
    setPositionInHook,
  ]);

  const handlePlayerMove = useCallback(
    (dx: number, dy: number) => {
      if (!currentMap || !player || isLoadingMap || isCellSelectionModeActive)
        return;

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
      isCellSelectionModeActive,
    ],
  );

  const currentCell: MapCell | undefined =
    currentMap?.grid[playerPositionFromHook.y]?.[playerPositionFromHook.x];
  const interactableTarget = currentCell?.leadsTo;

  const handleInteraction = useCallback(() => {
    if (
      !interactableTarget ||
      !currentMap ||
      !player ||
      !gameSeed ||
      isLoadingMap ||
      isCellSelectionModeActive
    )
      return;

    const {
      mapId: newMapIdFromCell,
      targetX,
      targetY,
      exitToWorldDirection,
    } = interactableTarget;
    dispatch({ type: 'TRANSITION_MAP_INIT' });

    if (newMapIdFromCell === PREVIOUS_MAP_SENTINEL) {
      if (previousLocation) {
        const seedForPrevMap =
          previousLocation.mapId === PRIMARY_WORLD_MAP_ID
            ? gameSeed
            : `${previousLocation.mapId}_seed`;

        const oldMap = getMap(previousLocation.mapId, seedForPrevMap);
        if (oldMap) {
          let finalPlayerX = previousLocation.x;
          let finalPlayerY = previousLocation.y;

          if (
            previousLocation.mapId === PRIMARY_WORLD_MAP_ID &&
            exitToWorldDirection
          ) {
            let newX = previousLocation.x;
            let newY = previousLocation.y;
            switch (exitToWorldDirection) {
              case 'N':
                newY--;
                break;
              case 'E':
                newX++;
                break;
              case 'S':
                newY++;
                break;
              case 'W':
                newX--;
                break;
            }
            if (
              newX >= 0 &&
              newX < oldMap.width &&
              newY >= 0 &&
              newY < oldMap.height &&
              oldMap.grid[newY]?.[newX]?.walkable
            ) {
              finalPlayerX = newX;
              finalPlayerY = newY;
            } else {
              console.warn(
                `[App] Invalid exit placement to ${newX},${newY} on ${PRIMARY_WORLD_MAP_ID}. Defaulting to city marker. Check walkability and map bounds.`,
              );
            }
          }

          dispatch({ type: 'CLEAR_PREVIOUS_LOCATION' });
          dispatch({
            type: 'TRANSITION_MAP_SUCCESS',
            payload: {
              map: oldMap,
              position: { x: finalPlayerX, y: finalPlayerY },
            },
          });
          setPositionInHook({ x: finalPlayerX, y: finalPlayerY });
        } else {
          console.error(
            `[App] Failed to load previous map: ${previousLocation.mapId} with seed: ${seedForPrevMap}`,
          );
          dispatch({
            type: 'TRANSITION_MAP_FAILURE',
            payload: { error: `Prev map fail` },
          });
        }
      } else {
        console.error('[App] No previousLocation for PREVIOUS_MAP_SENTINEL');
        dispatch({
          type: 'TRANSITION_MAP_FAILURE',
          payload: { error: 'No prev loc' },
        });
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
      const seedForNewMap =
        newMapIdFromCell === PRIMARY_WORLD_MAP_ID ? gameSeed : undefined;

      const newMap = getMap(newMapIdFromCell, seedForNewMap);
      if (newMap) {
        dispatch({
          type: 'TRANSITION_MAP_SUCCESS',
          payload: { map: newMap, position: { x: targetX, y: targetY } },
        });
        setPositionInHook({ x: targetX, y: targetY });
      } else {
        console.error(
          `[App] Failed to load new map: ${newMapIdFromCell} with seed: ${seedForNewMap}`,
        );
        dispatch({
          type: 'TRANSITION_MAP_FAILURE',
          payload: { error: `New map fail` },
        });
        if (currentMap.id !== newMapIdFromCell)
          dispatch({ type: 'CLEAR_PREVIOUS_LOCATION' });
      }
    }
  }, [
    interactableTarget,
    currentMap,
    isLoadingMap,
    dispatch,
    previousLocation,
    setPositionInHook,
    player,
    gameSeed,
    playerPositionFromHook,
    isCellSelectionModeActive,
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
        case 'e':
        case 'enter':
          if (interactableTarget) {
            handleInteraction();
          }
          return;
        default:
          return;
      }
      if (dx !== 0 || dy !== 0) {
        handlePlayerMove(dx, dy);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handlePlayerMove,
    currentScreen,
    isLoadingMap,
    interactableTarget,
    handleInteraction,
    isCellSelectionModeActive,
  ]);

  useEffect(() => {
    // Check for debug mode URL parameter on initial load
    const queryParams = new URLSearchParams(window.location.search);
    const isDebug = queryParams.get('debug') === 'true';
    dispatch({ type: 'LOG_DEBUG_STATUS', payload: { isDebug } });
  }, [dispatch]);

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

    const handleDebugCellSelect = (x: number, y: number) => {
      dispatch({ type: 'LOG_SELECTED_CELL_COORDS', payload: { x, y } });
    };

    return (
      <div className="App-container">
        <main className="App-main">
          <div className="game-map-column">
            {player && currentMap && playerPositionFromHook && (
              <MapDisplay
                key={`${currentMap.id}-${currentMap.seed}`}
                gameMap={currentMap}
                player={player}
                playerPosition={playerPositionFromHook}
                fogMap={currentMapFog}
                isCellSelectionModeActive={isCellSelectionModeActive}
                onDebugCellSelect={handleDebugCellSelect}
              />
            )}
          </div>
          <div className="game-controls-column">
            <div className="controls-row-wrapper">
              <div className="info-and-interaction-container">
                {interactableTarget && (
                  <button
                    onClick={handleInteraction}
                    className="interaction-button"
                  >
                    Interact (E/Enter) - Go to{' '}
                    {interactableTarget.mapId === PREVIOUS_MAP_SENTINEL
                      ? 'Previous Map'
                      : interactableTarget.mapId}
                  </button>
                )}
                <div className="player-info">
                  <p>
                    Player: {player?.name} (Lvl {player?.level})
                  </p>
                  <p>
                    Position: ({playerPositionFromHook.x},{' '}
                    {playerPositionFromHook.y})
                  </p>
                  {currentCell && (
                    <>
                      <p>Current Tile: {currentCell.terrain}</p>
                      <p>Walkable: {currentCell.walkable ? 'Yes' : 'No'}</p>
                      {currentCell.leadsTo && (
                        <p style={{ color: 'cyan' }}>
                          Leads to:{' '}
                          {currentCell.leadsTo.mapId === PREVIOUS_MAP_SENTINEL
                            ? 'Previous Map'
                            : currentCell.leadsTo.mapId}{' '}
                          at ({currentCell.leadsTo.targetX},{' '}
                          {currentCell.leadsTo.targetY})
                          {currentCell.leadsTo.exitToWorldDirection &&
                            ` via ${currentCell.leadsTo.exitToWorldDirection}`}
                        </p>
                      )}
                      {currentCell.interaction && (
                        <p style={{ color: 'yellow' }}>
                          Interaction: {currentCell.interaction.type}{' '}
                          {currentCell.interaction.cityId &&
                            `(${currentCell.interaction.cityId})`}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="movement-controls-container">
                <MovementControls onMove={handlePlayerMove} />
                {isDebugMode && (
                  <button
                    onClick={() =>
                      dispatch({ type: 'TOGGLE_CELL_SELECTION_MODE' })
                    }
                    style={{
                      marginTop: '10px',
                      backgroundColor: isCellSelectionModeActive
                        ? '#dc3545'
                        : '#ffc107',
                      color: 'black',
                    }}
                  >
                    {isCellSelectionModeActive
                      ? 'Cancel Cell Selection'
                      : 'Debug Select Cell'}
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={() => dispatch({ type: 'RETURN_TO_MAIN_MENU' })}
              className="menu-return-button"
              title="Return to Main Menu"
              style={{
                marginTop: '15px',
                padding: '8px 12px',
                fontSize: '1.2em',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                lineHeight: '1',
              }}
            >
              🏠
            </button>
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
