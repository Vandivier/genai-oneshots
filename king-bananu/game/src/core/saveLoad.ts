import type { GameState, GameSave, GameSaveSlot } from '../types/gameTypes';

const LOCAL_STORAGE_KEY = 'kingBananuGameSaves';
const MAX_SAVE_SLOTS = 5;

// Initialize save slots if they don't exist
function getInitialSaveData(): GameSave {
  const slots: GameSaveSlot[] = [];
  for (let i = 1; i <= MAX_SAVE_SLOTS; i++) {
    slots.push({
      id: i,
      timestamp: undefined,
      gameName: undefined,
      data: undefined,
    });
  }
  return { userId: 'localUser', saveSlots: slots }; // userId will be updated with Supabase later
}

// Load all save data from localStorage
export function loadAllSaveData(): GameSave {
  try {
    const savedDataString = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedDataString) {
      const parsedData = JSON.parse(savedDataString) as GameSave;
      // Ensure all slots are present, even if save file is older
      if (parsedData.saveSlots.length < MAX_SAVE_SLOTS) {
        const initialData = getInitialSaveData();
        for (let i = 0; i < MAX_SAVE_SLOTS; i++) {
          const existingSlot = parsedData.saveSlots.find(
            (s) => s.id === initialData.saveSlots[i].id,
          );
          if (existingSlot) {
            initialData.saveSlots[i] = existingSlot;
          }
        }
        return initialData;
      }
      return parsedData;
    }
  } catch (error) {
    console.error('Error loading game data from localStorage:', error);
    // Fallback to initial data if loading fails
  }
  return getInitialSaveData();
}

// Save all save data to localStorage
function persistAllSaveData(gameSave: GameSave): boolean {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(gameSave));
    return true;
  } catch (error) {
    console.error('Error saving game data to localStorage:', error);
    return false;
  }
}

// Save current game state to a specific slot
export function saveGame(
  slotId: number,
  gameState: GameState,
  gameName?: string,
): boolean {
  if (slotId < 1 || slotId > MAX_SAVE_SLOTS) {
    console.error(`Invalid save slot ID: ${slotId}`);
    return false;
  }
  const allSaves = loadAllSaveData();
  const slotIndex = allSaves.saveSlots.findIndex((s) => s.id === slotId);

  if (slotIndex !== -1) {
    allSaves.saveSlots[slotIndex] = {
      id: slotId,
      timestamp: Date.now(),
      gameName: gameName || `Save Slot ${slotId}`,
      data: gameState,
    };
    return persistAllSaveData(allSaves);
  }
  return false;
}

// Load game state from a specific slot
export function loadGame(slotId: number): GameState | undefined {
  if (slotId < 1 || slotId > MAX_SAVE_SLOTS) {
    console.error(`Invalid load slot ID: ${slotId}`);
    return undefined;
  }
  const allSaves = loadAllSaveData();
  const slot = allSaves.saveSlots.find((s) => s.id === slotId);
  return slot?.data;
}

// Delete save data from a specific slot
export function deleteSave(slotId: number): boolean {
  if (slotId < 1 || slotId > MAX_SAVE_SLOTS) {
    console.error(`Invalid delete slot ID: ${slotId}`);
    return false;
  }
  const allSaves = loadAllSaveData();
  const slotIndex = allSaves.saveSlots.findIndex((s) => s.id === slotId);

  if (slotIndex !== -1 && allSaves.saveSlots[slotIndex].data) {
    allSaves.saveSlots[slotIndex] = {
      id: slotId,
      timestamp: undefined,
      gameName: undefined,
      data: undefined,
    };
    return persistAllSaveData(allSaves);
  }
  return false;
}

// Get metadata for all save slots (e.g., for display in a load menu)
export function getSaveSlotMetadata(): Omit<GameSaveSlot, 'data'>[] {
  const allSaves = loadAllSaveData();
  return allSaves.saveSlots.map((slot) => ({
    id: slot.id,
    timestamp: slot.timestamp,
    gameName: slot.gameName,
  }));
}
