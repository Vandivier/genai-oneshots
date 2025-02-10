import Phaser from "phaser";

class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene"); // Scene key is 'GameScene'
  }

  preload() {
    // Load assets here (images, sounds, etc.)
  }

  create() {
    // Create game objects and logic here
    this.cameras.main.setBackgroundColor("#3498db"); // Set background color (example: blue)

    this.add.text(100, 100, "Phaser 3 Game Scene is Running!", {
      font: "32px Arial",
      color: "#ffffff",
    });
  }

  update(time: number, delta: number): void {
    // Game loop update logic (runs every frame)
  }
}

export default GameScene;
