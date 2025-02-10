import {
  PlayerData,
  Stats,
  Spell,
  Item,
  Buff,
  calculateExperienceToNextLevel,
} from "./types";
import seedrandom from "seedrandom";

export class PlayerManager {
  private data: PlayerData;
  private rng: seedrandom.PRNG;

  constructor(name: string) {
    this.rng = seedrandom(name); // Seed RNG with player name
    this.data = this.initializePlayer(name);
  }

  private initializePlayer(name: string): PlayerData {
    const baseStats: Stats = {
      hp: 100,
      maxHp: 100,
      mp: 50,
      maxMp: 50,
      level: 1,
      experience: 0,
      experienceToNextLevel: calculateExperienceToNextLevel(1),
      attack: 10,
      defense: 5,
    };

    return {
      ...baseStats,
      name,
      spells: this.generateInitialSpells(),
      items: [],
      buffs: [],
    };
  }

  private generateInitialSpells(): Spell[] {
    const elements: Array<Spell["element"]> = [
      "fire",
      "ice",
      "lightning",
      "earth",
    ];
    const spells: Spell[] = [];

    // Always give a basic attack spell
    spells.push({
      name: "Magic Missile",
      damage: 15,
      mpCost: 5,
      element: "lightning",
      description: "A basic magic attack that never misses",
    });

    // Generate 2 random element-based spells
    for (let i = 0; i < 2; i++) {
      const element = elements[Math.floor(this.rng() * elements.length)];
      const spell = this.generateSpell(element);
      spells.push(spell);
    }

    return spells;
  }

  private generateSpell(element: Spell["element"]): Spell {
    const spellTypes = {
      fire: ["Fireball", "Flame Burst", "Inferno"],
      ice: ["Ice Shard", "Frost Nova", "Blizzard"],
      lightning: ["Thunder Bolt", "Chain Lightning", "Storm"],
      earth: ["Rock Throw", "Earthquake", "Boulder Crush"],
    };

    const names = spellTypes[element];
    const name = names[Math.floor(this.rng() * names.length)];

    return {
      name,
      damage: 20 + Math.floor(this.rng() * 15),
      mpCost: 10 + Math.floor(this.rng() * 10),
      element,
      description: `A ${element}-based spell that deals damage`,
    };
  }

  public getData(): PlayerData {
    return { ...this.data };
  }

  public takeDamage(amount: number): void {
    this.data.hp = Math.max(0, this.data.hp - amount);
  }

  public useMp(amount: number): boolean {
    if (this.data.mp >= amount) {
      this.data.mp -= amount;
      return true;
    }
    return false;
  }

  public heal(amount: number): void {
    this.data.hp = Math.min(this.data.maxHp, this.data.hp + amount);
  }

  public restoreMp(amount: number): void {
    this.data.mp = Math.min(this.data.maxMp, this.data.mp + amount);
  }

  public gainExperience(amount: number): boolean {
    this.data.experience += amount;

    if (this.data.experience >= this.data.experienceToNextLevel) {
      this.levelUp();
      return true;
    }

    return false;
  }

  private levelUp(): void {
    this.data.level += 1;
    this.data.experience -= this.data.experienceToNextLevel;
    this.data.experienceToNextLevel = calculateExperienceToNextLevel(
      this.data.level
    );

    // Increase stats
    this.data.maxHp += 20;
    this.data.maxMp += 10;
    this.data.hp = this.data.maxHp;
    this.data.mp = this.data.maxMp;
    this.data.attack += 5;
    this.data.defense += 3;

    // Chance to learn a new spell
    if (this.rng() < 0.3) {
      // 30% chance
      const elements: Array<Spell["element"]> = [
        "fire",
        "ice",
        "lightning",
        "earth",
      ];
      const element = elements[Math.floor(this.rng() * elements.length)];
      const newSpell = this.generateSpell(element);
      this.data.spells.push(newSpell);
    }
  }

  public addBuff(buff: Buff): void {
    this.data.buffs.push(buff);
  }

  public addItem(item: Item): void {
    this.data.items.push(item);
  }

  public useItem(index: number): boolean {
    if (index < 0 || index >= this.data.items.length) return false;

    const item = this.data.items[index];
    switch (item.type) {
      case "healing":
        this.heal(item.value);
        break;
      case "mana":
        this.restoreMp(item.value);
        break;
      case "buff":
        // Implementation depends on buff system
        break;
    }

    this.data.items.splice(index, 1);
    return true;
  }

  public updateBuffs(): void {
    for (let i = this.data.buffs.length - 1; i >= 0; i--) {
      const buff = this.data.buffs[i];
      buff.duration--;
      if (buff.duration <= 0) {
        this.data.buffs.splice(i, 1);
      }
    }
  }
}
