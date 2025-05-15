import Phaser from "phaser";

export class PreloaderScene extends Phaser.Scene {
  constructor() {
    super("PreloaderScene");
  }

  preload() {
    // Load assets here (e.g., images, audio)
    console.log("PreloaderScene: preload");
    // Example: this.load.image('logo', 'assets/logo.png');

    // For now, let's just display some text and prepare for MainMenuScene
    // The actual asset loading will happen here, and upon completion,
    // we will transition.
  }

  create() {
    console.log("PreloaderScene: create");
    this.createPlaceholderTiles();

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

    // Simulate asset loading completion and start MainMenuScene
    // In a real game, this would be tied to this.load.on('complete', ...);
    // but since we are generating textures in create(), we transition after that.
    console.log(
      "PreloaderScene: placeholder tiles created, starting MainMenuScene"
    );
    this.scene.start("MainMenuScene");
  }

  private createPlaceholderTiles() {
    const tileSize = 32; // Define a standard tile size

    // Tile Index Mapping:
    // 0: Water (Blue)
    // 1: Land (Sandy Brown)
    // 2: Grass (Green)
    // 3: Forest (Dark Green)
    // 4: Hills (Brownish-Green)
    // 5: Mountains (Gray)
    // 6: Road (Dark Gray)

    let graphics = this.add.graphics();

    // 0: Water Tile (Blue)
    graphics.fillStyle(0x0000ff, 1);
    graphics.fillRect(0, 0, tileSize, tileSize);
    graphics.generateTexture("tile_water", tileSize, tileSize);
    graphics.clear();

    // 1: Land Tile (Sandy Brown)
    graphics.fillStyle(0xd2b48c, 1); // Tan / Sandy Brown
    graphics.fillRect(0, 0, tileSize, tileSize);
    graphics.generateTexture("tile_land", tileSize, tileSize);
    graphics.clear();

    // 2: Grass Tile (Green)
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, tileSize, tileSize);
    graphics.generateTexture("tile_grass", tileSize, tileSize);
    graphics.clear();

    // 3: Forest Tile (Dark Green)
    graphics.fillStyle(0x006400, 1); // Dark Green
    graphics.fillRect(0, 0, tileSize, tileSize);
    // Add some tree-like circles for visual cue
    graphics.fillStyle(0x004000, 1);
    graphics.fillCircle(tileSize * 0.3, tileSize * 0.3, tileSize * 0.2);
    graphics.fillCircle(tileSize * 0.7, tileSize * 0.4, tileSize * 0.25);
    graphics.fillCircle(tileSize * 0.5, tileSize * 0.7, tileSize * 0.22);
    graphics.generateTexture("tile_forest", tileSize, tileSize);
    graphics.clear();

    // 4: Hills Tile (Brownish-Green)
    graphics.fillStyle(0x8b4513, 0.7); // Brown base
    graphics.fillRect(0, 0, tileSize, tileSize);
    graphics.fillStyle(0x556b2f, 0.5); // Dark olive green overlay
    graphics.fillCircle(tileSize / 2, tileSize / 2, tileSize / 3);
    graphics.generateTexture("tile_hills", tileSize, tileSize);
    graphics.clear();

    // 5: Mountains Tile (Gray with peak)
    graphics.fillStyle(0x808080, 1); // Gray base
    graphics.fillRect(0, 0, tileSize, tileSize);
    graphics.lineStyle(2, 0x505050, 1);
    graphics.beginPath();
    graphics.moveTo(tileSize * 0.1, tileSize * 0.9);
    graphics.lineTo(tileSize / 2, tileSize * 0.2);
    graphics.lineTo(tileSize * 0.9, tileSize * 0.9);
    graphics.closePath();
    graphics.strokePath();
    // Add a touch of white for a snow cap
    graphics.fillStyle(0xffffff, 0.8);
    graphics.fillTriangle(
      tileSize / 2,
      tileSize * 0.2,
      tileSize * 0.4,
      tileSize * 0.4,
      tileSize * 0.6,
      tileSize * 0.4
    );
    graphics.generateTexture("tile_mountains", tileSize, tileSize);
    graphics.clear();

    // 6: Road Tile (Dark Gray)
    graphics.fillStyle(0x404040, 1); // Dark Gray
    graphics.fillRect(0, 0, tileSize, tileSize);
    // Add a dashed yellow line for classic road look
    graphics.lineStyle(tileSize / 10, 0xffff00, 1);
    graphics.beginPath();
    graphics.moveTo(tileSize * 0.5, tileSize * 0.1);
    graphics.lineTo(tileSize * 0.5, tileSize * 0.4);
    graphics.moveTo(tileSize * 0.5, tileSize * 0.6);
    graphics.lineTo(tileSize * 0.5, tileSize * 0.9);
    graphics.strokePath();
    graphics.generateTexture("tile_road", tileSize, tileSize);
    graphics.destroy(); // Destroy graphics object once all textures are generated

    console.log(
      "Placeholder tiles created: water, land, grass, forest, hills, mountains, road"
    );
  }
}
