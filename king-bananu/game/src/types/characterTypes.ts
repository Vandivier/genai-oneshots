// src/types/characterTypes.ts

export interface Ability {
  id: string;
  name: string;
  description: string;
  damage?: number; // Optional: some abilities might not do direct damage
  healing?: number; // Optional: some abilities might heal
  // Add other properties like area of effect, status effects, cost (MP/stamina), etc.
}

export interface BaseCharacter {
  id: string;
  name: string;
  level: number;
  currentHp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  abilities: Ability[];
  // Consider adding experience points, status effects, resistances, weaknesses etc.
}

export interface PlayerCharacter extends BaseCharacter {
  experience: number;
  experienceToNextLevel: number;
  // Player-specific attributes like equipped items, gold, etc.
}

export interface Enemy extends BaseCharacter {
  lootTableId?: string; // ID to look up potential item drops
  // Enemy-specific attributes like AI behavior type, etc.
} 