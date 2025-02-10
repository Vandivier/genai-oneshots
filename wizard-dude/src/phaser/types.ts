export interface Stats {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  attack: number;
  defense: number;
}

export interface PlayerData extends Stats {
  name: string;
  spells: Spell[];
  items: Item[];
  buffs: Buff[];
}

export interface Enemy extends Stats {
  type: string;
  sprite: string;
  rewards: {
    experience: number;
    items?: Item[];
  };
}

export interface Spell {
  name: string;
  damage: number;
  mpCost: number;
  element: "fire" | "ice" | "lightning" | "earth";
  description: string;
}

export interface Item {
  name: string;
  type: "healing" | "mana" | "buff";
  value: number;
  description: string;
}

export interface Buff {
  name: string;
  type: "attack" | "defense" | "hp" | "mp";
  value: number;
  duration: number;
  description: string;
}

// Helper functions for game mechanics
export const calculateExperienceToNextLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

export const calculateEnemyStats = (playerLevel: number): Stats => {
  const scalingFactor = 1 + (playerLevel - 1) * 0.5;
  return {
    hp: Math.floor(50 * scalingFactor),
    maxHp: Math.floor(50 * scalingFactor),
    mp: Math.floor(20 * scalingFactor),
    maxMp: Math.floor(20 * scalingFactor),
    level: playerLevel,
    experience: 0,
    experienceToNextLevel: 0,
    attack: Math.floor(10 * scalingFactor),
    defense: Math.floor(5 * scalingFactor),
  };
};
