import type { PlayerCharacter, Ability } from '../../types/characterTypes';

// Example: Define how much XP is needed for each level
// This could be a formula or a predefined array/object
const XP_PER_LEVEL = [
  0, // Level 0 (or 1 if 1-indexed)
  100, // XP to reach Level 2
  250, // XP to reach Level 3
  500, // XP to reach Level 4
  1000, // XP to reach Level 5
  // ... and so on
];

export function getXPForNextLevel(level: number): number {
  if (level < 0) return Infinity;
  if (level >= XP_PER_LEVEL.length - 1) {
    // For levels beyond what's defined, you might use a formula
    // For now, let's just make it very high or handle as max level
    const lastDefinedXp = XP_PER_LEVEL[XP_PER_LEVEL.length - 1];
    return (
      lastDefinedXp +
      (level - (XP_PER_LEVEL.length - 2)) * (lastDefinedXp * 0.5)
    ); // Example formula
  }
  return XP_PER_LEVEL[level]; // Assuming level is 1-indexed for array access
}

interface LevelUpStatIncreases {
  maxHp?: number;
  attack?: number;
  defense?: number;
  speed?: number;
  // Could also include MP, new abilities, etc.
}

// Placeholder for stat increases per level - this would be class/character specific
function getStatIncreasesForLevelUp(level: number): LevelUpStatIncreases {
  // Example: Simple linear increase, or could be more complex
  return {
    maxHp: 10 + Math.floor(level / 2) * 5, // More HP early on
    attack: 2 + Math.floor(level / 3),
    defense: 1 + Math.floor(level / 3),
    speed: Math.floor(level / 5), // Speed increases less frequently
  };
}

// Placeholder for new abilities per level - also class/character specific
function getNewAbilitiesForLevel(level: number): Ability[] {
  const newAbilities: Ability[] = [];
  // Example: Learn a new ability at level 3 and 5
  if (level === 3) {
    newAbilities.push({
      id: 'power_strike',
      name: 'Power Strike',
      description: 'A strong attack.',
      damage: 20,
    });
  }
  if (level === 5) {
    newAbilities.push({
      id: 'heal_light',
      name: 'Heal Light',
      description: 'Minor healing.',
      healing: 30,
    });
  }
  return newAbilities;
}

export function gainExperience(
  character: PlayerCharacter,
  amount: number,
): {
  updatedCharacter: PlayerCharacter;
  leveledUp: boolean;
  messages: string[];
} {
  if (amount <= 0)
    return { updatedCharacter: character, leveledUp: false, messages: [] };

  let currentCharacterState = { ...character }; // Use a different name to avoid confusion with return value key
  currentCharacterState.experience += amount;

  let leveledUp = false;
  const messages: string[] = [`${character.name} gained ${amount} XP!`];

  // Check for level up
  while (
    currentCharacterState.experience >=
      currentCharacterState.experienceToNextLevel &&
    currentCharacterState.level < 100 // Assuming 100 is max level
  ) {
    leveledUp = true;
    const newLevel = currentCharacterState.level + 1;
    messages.push(`${currentCharacterState.name} reached Level ${newLevel}!`);

    // Apply stat increases
    const statIncreases = getStatIncreasesForLevelUp(newLevel);
    const newAbilitiesLearned = getNewAbilitiesForLevel(newLevel);

    currentCharacterState = {
      ...currentCharacterState,
      level: newLevel,
      maxHp: currentCharacterState.maxHp + (statIncreases.maxHp || 0),
      currentHp: currentCharacterState.currentHp + (statIncreases.maxHp || 0), // Heal on level up
      attack: currentCharacterState.attack + (statIncreases.attack || 0),
      defense: currentCharacterState.defense + (statIncreases.defense || 0),
      speed: currentCharacterState.speed + (statIncreases.speed || 0),
      abilities: [...currentCharacterState.abilities, ...newAbilitiesLearned],
      experienceToNextLevel:
        newLevel >= 100 ? Infinity : getXPForNextLevel(newLevel),
      // If max level, cap XP to the amount needed for that level.
      // Otherwise, experience remains as is, to be checked against the new experienceToNextLevel.
      experience:
        newLevel >= 100
          ? getXPForNextLevel(newLevel - 1)
          : currentCharacterState.experience,
    };

    if (statIncreases.maxHp)
      messages.push(`Max HP increased by ${statIncreases.maxHp}!`);
    if (statIncreases.attack)
      messages.push(`Attack increased by ${statIncreases.attack}!`);
    if (statIncreases.defense)
      messages.push(`Defense increased by ${statIncreases.defense}!`);
    if (statIncreases.speed)
      messages.push(`Speed increased by ${statIncreases.speed}!`);
    if (newAbilitiesLearned.length > 0) {
      newAbilitiesLearned.forEach((ability) =>
        messages.push(`${currentCharacterState.name} learned ${ability.name}!`),
      );
    }
  }
  return { updatedCharacter: currentCharacterState, leveledUp, messages };
}
