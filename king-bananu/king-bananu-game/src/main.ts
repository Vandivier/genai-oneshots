import Phaser from "phaser";
import { MainMenuScene } from "./scenes/MainMenuScene";
import { PreloaderScene } from "./scenes/PreloaderScene";
import { GameScene } from "./scenes/GameScene"; // Placeholder for the main game

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "app", // ID of the div to inject the game into
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false, // Set to true for physics debugging
    },
  },
  scene: [PreloaderScene, MainMenuScene, GameScene], // Add scenes here
};

new Phaser.Game(config);
