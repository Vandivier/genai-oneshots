import React, {
  createContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';
import type { GameMap } from '../types/mapTypes';
import type { PlayerPosition } from '../types/gameTypes';
import type { PlayerCharacter } from '../types/characterTypes';
import type { AllFogData, FogMap, FogCellState } from '../types/fogTypes';

const INITIAL_PLAYER_POSITION_FOR_STATE: PlayerPosition = { x: 5, y: 5 };
const initialPlayerForState: PlayerCharacter = {
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

// 1. Define State
export interface AppState {
  currentScreen: 'MainMenu' | 'GameScreen';
  gameSeed: string | null;
  currentMap?: GameMap;
  player?: PlayerCharacter;
  currentPosition: PlayerPosition;
  previousLocation?: { mapId: string; x: number; y: number } | null;
  isLoadingMap: boolean;
  error?: string | null;
  fogData: AllFogData;
  isDebugMode: boolean;
  isCellSelectionModeActive: boolean;
}

// 2. Define Actions
export type AppAction =
  | { type: 'START_NEW_GAME_INIT'; payload?: { seed?: string } }
  | {
      type: 'INITIALIZE_GAME_SUCCESS';
      payload: {
        map: GameMap;
        position: PlayerPosition;
      };
    }
  | { type: 'INITIALIZE_GAME_FAILURE'; payload: { error: string } }
  | { type: 'TRANSITION_MAP_INIT' }
  | {
      type: 'TRANSITION_MAP_SUCCESS';
      payload: { map: GameMap; position: PlayerPosition };
    }
  | { type: 'TRANSITION_MAP_FAILURE'; payload: { error: string } }
  | { type: 'SET_PREVIOUS_LOCATION'; payload: AppState['previousLocation'] }
  | { type: 'CLEAR_PREVIOUS_LOCATION' }
  | { type: 'UPDATE_PLAYER_POSITION'; payload: { position: PlayerPosition } } // Primarily for usePlayerMovement to react to context changes
  | { type: 'SET_CURRENT_SCREEN'; payload: AppState['currentScreen'] }
  | { type: 'RETURN_TO_MAIN_MENU' }
  // FoW Actions
  | {
      type: 'INITIALIZE_OR_UPDATE_FOG';
      payload: {
        mapId: string;
        mapWidth: number;
        mapHeight: number;
        visibilityRadius: number;
        playerPosition: PlayerPosition;
      };
    }
  | { type: 'ADVANCE_FOG_TURNS'; payload: { mapId: string } } // Advances turn for current map's fog
  | { type: 'LOG_DEBUG_STATUS'; payload: { isDebug: boolean } }
  | { type: 'TOGGLE_CELL_SELECTION_MODE' }
  | { type: 'LOG_SELECTED_CELL_COORDS'; payload: { x: number; y: number } };

// 3. Initial State
export const initialAppState: AppState = {
  currentScreen: 'MainMenu',
  gameSeed: null,
  currentMap: undefined,
  player: undefined,
  currentPosition: INITIAL_PLAYER_POSITION_FOR_STATE,
  previousLocation: null,
  isLoadingMap: false,
  error: null,
  fogData: {},
  isDebugMode: false,
  isCellSelectionModeActive: false,
};

const FOG_FADE_TURNS = 10; // Turns after which explored cells fade to unseen

// Helper to create a new, fully unseen fog map
const createNewFogMap = (width: number, height: number): FogMap => {
  return Array(height)
    .fill(null)
    .map(() =>
      Array(width)
        .fill(null)
        .map(
          () =>
            ({
              status: 'Unseen',
              turnsSinceLastSeen: 0,
            }) as FogCellState,
        ),
    );
};

// 4. Create Reducer
export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'START_NEW_GAME_INIT': {
      const userProvidedSeed = action.payload?.seed;
      const newGameSeed = userProvidedSeed || Date.now().toString();
      console.log(
        `[AppContext] New game started. User seed: "${userProvidedSeed || ''}", Effective seed: ${newGameSeed}`,
      );
      return {
        ...initialAppState,
        gameSeed: newGameSeed,
        player: initialPlayerForState,
        isLoadingMap: true,
        currentScreen: 'GameScreen',
        fogData: {},
        isDebugMode: state.isDebugMode,
        isCellSelectionModeActive: false,
      };
    }
    case 'INITIALIZE_GAME_SUCCESS':
      return {
        ...state,
        isLoadingMap: false,
        currentMap: action.payload.map,
        currentPosition: action.payload.position,
        previousLocation: null,
        error: null,
        // Fog will be initialized by a subsequent INITIALIZE_OR_UPDATE_FOG dispatch
      };
    case 'INITIALIZE_GAME_FAILURE':
      return {
        ...state,
        isLoadingMap: false,
        currentScreen: 'MainMenu',
        error: action.payload.error,
        currentMap: undefined,
        player: undefined,
      };
    case 'TRANSITION_MAP_INIT':
      return { ...state, isLoadingMap: true, error: null };
    case 'TRANSITION_MAP_SUCCESS':
      return {
        ...state,
        isLoadingMap: false,
        currentMap: action.payload.map,
        currentPosition: action.payload.position,
        error: null,
        // Fog for the new map will be handled by INITIALIZE_OR_UPDATE_FOG
      };
    case 'TRANSITION_MAP_FAILURE':
      return {
        ...state,
        isLoadingMap: false,
        error: action.payload.error,
      };
    case 'SET_PREVIOUS_LOCATION':
      return { ...state, previousLocation: action.payload };
    case 'CLEAR_PREVIOUS_LOCATION':
      return { ...state, previousLocation: null };
    case 'UPDATE_PLAYER_POSITION':
      return { ...state, currentPosition: action.payload.position };
    case 'SET_CURRENT_SCREEN':
      return { ...state, currentScreen: action.payload };
    case 'RETURN_TO_MAIN_MENU':
      return {
        ...initialAppState,
        currentScreen: 'MainMenu',
        gameSeed: null,
        fogData: {},
        isDebugMode: state.isDebugMode,
        isCellSelectionModeActive: false,
      };
    case 'INITIALIZE_OR_UPDATE_FOG': {
      const { mapId, mapWidth, mapHeight, playerPosition, visibilityRadius } =
        action.payload;
      const currentFogForMap =
        state.fogData[mapId] || createNewFogMap(mapWidth, mapHeight);

      // Update visibility based on player position and radius
      const newFogForMap = currentFogForMap.map((row, y) =>
        row.map((cell, x) => {
          const distance = Math.sqrt(
            Math.pow(x - playerPosition.x, 2) +
              Math.pow(y - playerPosition.y, 2),
          );
          let newStatus = cell.status;
          let newTurnsSinceLastSeen = cell.turnsSinceLastSeen;

          if (distance <= visibilityRadius) {
            newStatus = 'Visible';
            newTurnsSinceLastSeen = 0;
          } else if (cell.status === 'Visible') {
            // Was visible, now out of sight
            newStatus = 'Explored';
            newTurnsSinceLastSeen = 0; // Start counting turns for fading
          }
          // For cells already Unseen or Explored (and not becoming visible), their status and counter remain as is for now
          // (ADVANCE_FOG_TURNS will handle incrementing for Explored cells)

          return {
            ...cell,
            status: newStatus,
            turnsSinceLastSeen: newTurnsSinceLastSeen,
          };
        }),
      );

      return {
        ...state,
        fogData: {
          ...state.fogData,
          [mapId]: newFogForMap,
        },
      };
    }
    case 'ADVANCE_FOG_TURNS': {
      const { mapId } = action.payload;
      const currentFogForMap = state.fogData[mapId];
      if (!currentFogForMap) return state; // No fog data for this map yet

      const updatedFogForMap = currentFogForMap.map((row) =>
        row.map((cell) => {
          if (cell.status === 'Explored') {
            const newTurns = cell.turnsSinceLastSeen + 1;
            if (newTurns >= FOG_FADE_TURNS) {
              return {
                status: 'Unseen',
                turnsSinceLastSeen: 0,
              } as FogCellState;
            }
            return { ...cell, turnsSinceLastSeen: newTurns };
          }
          return cell;
        }),
      );

      return {
        ...state,
        fogData: {
          ...state.fogData,
          [mapId]: updatedFogForMap,
        },
      };
    }
    case 'LOG_DEBUG_STATUS':
      console.log(
        `[AppContext] Debug status from router: ${action.payload.isDebug}`,
      );
      return {
        ...state,
        isDebugMode: action.payload.isDebug,
      };
    case 'TOGGLE_CELL_SELECTION_MODE':
      return {
        ...state,
        isCellSelectionModeActive: !state.isCellSelectionModeActive,
      };
    case 'LOG_SELECTED_CELL_COORDS':
      console.log(
        `[AppContext] Debug: Selected cell coordinates: (${action.payload.x}, ${action.payload.y})`,
      );
      return {
        ...state,
        isCellSelectionModeActive: false,
      };
    default:
      // This explicit check helps catch unhandled actions if using a discriminated union for AppAction
      // const _exhaustiveCheck: never = action;
      // return _exhaustiveCheck;
      return state;
  }
};

// 5. Create Context
export const AppContext = createContext<{
  state: AppState;
  dispatch: Dispatch<AppAction>;
}>({
  // Default values for the context
  state: initialAppState,
  dispatch: () => null, // Placeholder dispatch
});

// 6. Create Provider Component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialAppState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};
