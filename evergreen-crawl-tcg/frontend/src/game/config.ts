import Phaser from "phaser";
import { DungeonScene } from "../scenes/dungeon/DungeonScene";
import { CombatScene } from "../scenes/CombatScene";
import { ShopScene } from "../scenes/ShopScene";

export const createGameConfig = (playerId: number) => ({
  type: Phaser.AUTO,
  parent: "game-container",
  backgroundColor: "#000000",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 640,
    height: 640,
  },
  scene: [
    {
      key: "DungeonScene",
      scene: DungeonScene,
      data: { playerId },
    },
    CombatScene,
    ShopScene,
  ],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
});
