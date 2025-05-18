export type ItemType = 'weapon' | 'armor' | 'consumable' | 'keyItem';

export interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  // Properties specific to item type, e.g.:
  attackBonus?: number; // for weapons
  defenseBonus?: number; // for armor
  hpRecovery?: number; // for consumables
  // value, stackable, rarity, etc.
} 