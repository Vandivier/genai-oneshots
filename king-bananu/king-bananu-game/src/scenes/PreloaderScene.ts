import Phaser from "phaser";

export class PreloaderScene extends Phaser.Scene {
  constructor() {
    super("PreloaderScene");
  }

  preload() {
    // Load assets here (e.g., images, audio)
    console.log("PreloaderScene: preload");
    // Example: this.load.image('logo', 'assets/logo.png');

    // For now, let's just display some text
    this.load.on("complete", () => {
      console.log("PreloaderScene: load complete, starting MainMenuScene");
      this.scene.start("MainMenuScene");
    });
  }

  create() {
    console.log("PreloaderScene: create");
    // You can add a loading bar or message here if needed
    this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        "Loading...",
        {
          font: "18px Arial",
          color: "#ffffff",
        }
      )
      .setOrigin(0.5);
  }
}
