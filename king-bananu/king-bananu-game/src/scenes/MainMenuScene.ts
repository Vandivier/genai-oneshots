import Phaser from "phaser";

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super("MainMenuScene");
  }

  create() {
    console.log("MainMenuScene: create");

    this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 - 50,
        "King Bananu",
        {
          font: "32px Arial",
          color: "#ffffff",
        }
      )
      .setOrigin(0.5);

    // New Game Button
    const newGameButton = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 + 20,
        "New Game",
        {
          font: "24px Arial",
          color: "#ffffff",
          backgroundColor: "#333333",
          padding: { x: 10, y: 5 },
        }
      )
      .setOrigin(0.5)
      .setInteractive();

    newGameButton.on("pointerdown", () => {
      console.log("MainMenuScene: New Game clicked");
      // Later, this will transition to the actual game or character creation
      this.scene.start("GameScene");
    });

    // Load Game Button (placeholder)
    const loadGameButton = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 + 70,
        "Load Saved Game",
        {
          font: "24px Arial",
          color: "#ffffff",
          backgroundColor: "#333333",
          padding: { x: 10, y: 5 },
        }
      )
      .setOrigin(0.5)
      .setInteractive();

    loadGameButton.on("pointerdown", () => {
      console.log("MainMenuScene: Load Game clicked");
      // Implement load game functionality here
    });
  }
}
