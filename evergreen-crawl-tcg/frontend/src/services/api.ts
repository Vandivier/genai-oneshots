const API_BASE_URL = "http://localhost:8000/api/game";

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

const DEFAULT_OPTIONS: RequestInit = {
  credentials: "include",
  headers: DEFAULT_HEADERS,
};

export interface PlayerResponse {
  id: number;
  username: string;
  gold: number;
  created_at: string;
  cards: Array<{
    id: number;
    name: string;
    power_level: number;
    rarity: string;
    quantity: number;
  }>;
}

export interface DungeonCell {
  x: number;
  y: number;
  type: string;
  is_visible: boolean;
  is_visited: boolean;
}

export interface GameState {
  player: PlayerResponse;
  decks: Array<{
    id: number;
    name: string;
    card_count: number;
    cards: Array<any>;
  }>;
  active_dungeon: {
    floor: number;
    position: { x: number; y: number };
    visible_cells: DungeonCell[];
    player_stats: Record<string, any>;
  } | null;
  collection: Array<{
    card: any;
    quantity: number;
  }>;
}

class GameAPI {
  // Player Management
  async startGame(username: string): Promise<PlayerResponse> {
    const response = await fetch(`${API_BASE_URL}/start`, {
      ...DEFAULT_OPTIONS,
      method: "POST",
      body: JSON.stringify({ username }),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to start game: ${error}`);
    }
    return response.json();
  }

  async getPlayer(playerId: number): Promise<PlayerResponse> {
    const response = await fetch(
      `${API_BASE_URL}/player/${playerId}`,
      DEFAULT_OPTIONS
    );
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get player: ${error}`);
    }
    return response.json();
  }

  async deletePlayer(playerId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/player/${playerId}`, {
      ...DEFAULT_OPTIONS,
      method: "DELETE",
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to delete player: ${error}`);
    }
  }

  // Game State Management
  async getGameState(playerId: number): Promise<GameState> {
    const response = await fetch(
      `${API_BASE_URL}/state/${playerId}`,
      DEFAULT_OPTIONS
    );
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get game state: ${error}`);
    }
    return response.json();
  }

  async saveGameState(playerId: number, state: GameState): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/state/${playerId}`, {
      ...DEFAULT_OPTIONS,
      method: "PUT",
      body: JSON.stringify(state),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to save game state: ${error}`);
    }
  }

  // Dungeon Management
  async startDungeon(playerId: number): Promise<DungeonCell[]> {
    const response = await fetch(`${API_BASE_URL}/dungeon/${playerId}/start`, {
      ...DEFAULT_OPTIONS,
      method: "POST",
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to start dungeon: ${error}`);
    }
    return response.json();
  }

  async moveInDungeon(
    playerId: number,
    x: number,
    y: number
  ): Promise<{
    cells: DungeonCell[];
    event: any;
    position: { x: number; y: number };
  }> {
    const response = await fetch(`${API_BASE_URL}/dungeon/${playerId}/move`, {
      ...DEFAULT_OPTIONS,
      method: "POST",
      body: JSON.stringify({ x, y }),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to move in dungeon: ${error}`);
    }
    return response.json();
  }

  // Shop Management
  async getShop(playerId: number): Promise<{
    featured_card: any;
    featured_card_price: number;
    random_card_price: number;
    pack_price: number;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/shop/${playerId}`,
      DEFAULT_OPTIONS
    );
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get shop: ${error}`);
    }
    return response.json();
  }

  async buyItem(
    playerId: number,
    itemType: "featured" | "random" | "pack"
  ): Promise<{
    success: boolean;
    cards_received: any[];
    gold_remaining: number;
  }> {
    const response = await fetch(`${API_BASE_URL}/shop/${playerId}/buy`, {
      ...DEFAULT_OPTIONS,
      method: "POST",
      body: JSON.stringify({ item_type: itemType }),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to buy item: ${error}`);
    }
    return response.json();
  }

  // Deck Management
  async createDeck(
    name: string,
    cardIds: number[]
  ): Promise<{
    id: number;
    name: string;
    card_count: number;
    cards: any[];
  }> {
    const response = await fetch(`${API_BASE_URL}/deck`, {
      ...DEFAULT_OPTIONS,
      method: "POST",
      body: JSON.stringify({ name, cards: cardIds }),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create deck: ${error}`);
    }
    return response.json();
  }
}

export const gameAPI = new GameAPI();
