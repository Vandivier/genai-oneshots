import React, {
  createContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';
import type { GameMap } from '../types/mapTypes';
import type { PlayerPosition } from '../types/gameTypes';
import type { PlayerCharacter } from '../types/characterTypes';

// Initial values from App.tsx (will be used for initialAppState)
// const INITIAL_MAP_ID_FOR_STATE = 'worldmap_testseed'; // Removed unused constant
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
  currentMap?: GameMap;
  player?: PlayerCharacter;
  currentPosition: PlayerPosition;
  previousLocation?: { mapId: string; x: number; y: number } | null;
  isLoadingMap: boolean;
  error?: string | null;
}

// 2. Define Actions
export type AppAction =
  | { type: 'START_NEW_GAME_INIT' }
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
  | { type: 'RETURN_TO_MAIN_MENU' };

// 3. Initial State
export const initialAppState: AppState = {
  currentScreen: 'MainMenu',
  currentMap: undefined,
  player: undefined, // Will be set on new game
  currentPosition: INITIAL_PLAYER_POSITION_FOR_STATE,
  previousLocation: null,
  isLoadingMap: false,
  error: null,
};

// 4. Create Reducer
export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'START_NEW_GAME_INIT':
      return {
        ...initialAppState, // Reset most state for a new game
        player: initialPlayerForState, // Set player immediately
        isLoadingMap: true,
        currentScreen: 'GameScreen',
      };
    case 'INITIALIZE_GAME_SUCCESS':
      return {
        ...state,
        isLoadingMap: false,
        currentMap: action.payload.map,
        currentPosition: action.payload.position,
        previousLocation: null,
        error: null,
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
        ...initialAppState, // Reset to a clean main menu state
        currentScreen: 'MainMenu',
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
