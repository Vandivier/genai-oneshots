import { Enemy, Stats, Item, calculateEnemyStats } from "./types";
import seedrandom from "seedrandom";

export class EnemyManager {
  private rng: seedrandom.PRNG;

  constructor(seed: string) {
    this.rng = seedrandom(seed);
  }

  public generateEnemy(playerLevel: number): Enemy {
    const enemyTypes = [
      {
        type: "Slime",
        sprite: "slime",
        emoji: "🟢",
        minLevel: 1,
        difficulty: 0.8,
      },
      {
        type: "Goblin",
        sprite: "goblin",
        emoji: "👺",
        minLevel: 3,
        difficulty: 1.0,
      },
      {
        type: "Skeleton",
        sprite: "skeleton",
        emoji: "💀",
        minLevel: 4,
        difficulty: 1.2,
      },
      {
        type: "Dark Wizard",
        sprite: "dark-wizard",
        emoji: "🧙‍♂️",
        minLevel: 5,
        difficulty: 1.5,
      },
      {
        type: "Dragon",
        sprite: "dragon",
        emoji: "🐉",
        minLevel: 6,
        difficulty: 2.0,
      },
    ];

    // Filter enemies by player level
    const availableEnemies = enemyTypes.filter(
      (e) => playerLevel >= e.minLevel
    );

    // Always ensure at least one enemy type is available
    if (availableEnemies.length === 0) {
      availableEnemies.push(enemyTypes[0]);
    }

    // Higher level enemies have a better chance of appearing
    const weightedEnemies = availableEnemies.flatMap((enemy) =>
      // Repeat each enemy in the array based on how close it is to player level
      Array(Math.max(1, 5 - (playerLevel - enemy.minLevel))).fill(enemy)
    );

    const selectedEnemy =
      weightedEnemies[Math.floor(this.rng() * weightedEnemies.length)];

    const baseStats = calculateEnemyStats(playerLevel);
    const stats: Stats = {
      ...baseStats,
      hp: Math.floor(baseStats.hp * selectedEnemy.difficulty),
      maxHp: Math.floor(baseStats.maxHp * selectedEnemy.difficulty),
      attack: Math.floor(baseStats.attack * selectedEnemy.difficulty),
      defense: Math.floor(baseStats.defense * selectedEnemy.difficulty),
    };

    return {
      ...stats,
      type: selectedEnemy.type,
      sprite: selectedEnemy.sprite,
      emoji: selectedEnemy.emoji,
      rewards: this.generateRewards(playerLevel, selectedEnemy.difficulty),
    };
  }

  private generateRewards(
    playerLevel: number,
    difficulty: number
  ): Enemy["rewards"] {
    const baseExperience = 50 * playerLevel * difficulty;
    const experience = Math.floor(baseExperience * (0.8 + this.rng() * 0.4)); // ±20% variance

    const items: Item[] = [];

    // 30% chance for item drop, increased by difficulty
    if (this.rng() < 0.3 * difficulty) {
      const possibleItems: Item[] = [
        {
          name: "Health Potion",
          type: "healing",
          value: 50,
          description: "Restores 50 HP",
          emoji: "❤️",
        },
        {
          name: "Mana Potion",
          type: "mana",
          value: 25,
          description: "Restores 25 MP",
          emoji: "🌟",
        },
        {
          name: "Strength Elixir",
          type: "buff",
          value: 5,
          description: "Increases attack by 5 for 3 turns",
          emoji: "💪",
        },
      ];

      items.push(possibleItems[Math.floor(this.rng() * possibleItems.length)]);
    }

    return {
      experience,
      items: items.length > 0 ? items : undefined,
    };
  }

  public calculateDamage(
    attackerStats: Stats,
    defenderStats: Stats,
    isSpell: boolean = false
  ): number {
    const attackValue = attackerStats.attack * (isSpell ? 1.5 : 1); // Spells do 50% more damage
    const defenseValue = defenderStats.defense;

    // Base damage calculation with some randomness
    const baseDamage = Math.max(1, attackValue - defenseValue);
    const variance = 0.2; // ±20% damage variance
    const damageMultiplier = 1 - variance + this.rng() * variance * 2;

    return Math.floor(baseDamage * damageMultiplier);
  }
}
