export enum CellType {
  EMPTY = "empty",
  MONSTER = "monster",
  TREASURE = "treasure",
  TRAP = "trap",
  EXIT = "exit",
  MERCHANT = "merchant",
  SHRINE = "shrine",
  MINIBOSS = "miniboss",
  SAFE = "safe",
}

export interface Cell {
  x: number;
  y: number;
  type: CellType;
  isVisible: boolean;
  isVisited: boolean;
  isUsed?: boolean;
  data?: CellData;
}

export interface CellData {
  monsterStats?: {
    health: number;
    attack: number;
    defense: number;
  };
  treasureAmount?: number;
  trapDamage?: number;
  shrineEffect?: {
    type: "heal" | "maxhp" | "gold";
    amount: number;
  };
}

export interface PlayerProgress {
  level: number;
  playerStats: {
    health: number;
    maxHealth: number;
    gold: number;
    experience: number;
  };
  inventory: {
    cards: any[];
    items: any[];
  };
}
