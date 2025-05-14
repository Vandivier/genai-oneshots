import Phaser from "phaser";

export class GameScene extends Phaser.Scene {
  private player: Phaser.Physics.Arcade.Sprite | undefined;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;

  constructor() {
    super("GameScene");
  }

  preload() {
    console.log("GameScene: preload");
    // Load game-specific assets here if not already loaded in PreloaderScene
    // For example, player sprite, map tiles, etc.
    // this.load.image('player', 'assets/player.png');
    // this.load.image('tiles', 'assets/tileset.png');
    // this.load.tilemapTiledJSON('map', 'assets/map.json');
  }

  create() {
    console.log("GameScene: create");
    this.add.text(10, 10, "GameScene - Start of the Adventure!", {
      font: "16px Arial",
      color: "#ffffff",
    });
    this.add.text(10, 30, "Press ESC to return to Main Menu", {
      font: "12px Arial",
      color: "#dddddd",
    });

    // Placeholder for game world creation
    // Example: const map = this.make.tilemap({ key: 'map' });
    // const tileset = map.addTilesetImage('spritesheet', 'tiles');
    // const layer = map.createLayer('Tile Layer 1', tileset, 0, 0);

    // Basic player setup (replace with actual player sprite and animations later)
    this.player = this.physics.add
      .sprite(100, 100, "player-placeholder")
      .setVisible(false); // Invisible until asset is loaded
    // Create a simple placeholder graphic if no asset is loaded for 'player-placeholder'
    if (!this.textures.exists("player-placeholder")) {
      const graphics = this.add.graphics();
      graphics.fillStyle(0xff0000, 1);
      graphics.fillRect(0, 0, 32, 48);
      graphics.generateTexture("player-placeholder", 32, 48);
      graphics.destroy();
      this.player
        .setTexture("player-placeholder")
        .setVisible(true)
        .setCollideWorldBounds(true);
    }

    this.cameras.main.setBounds(0, 0, 1600, 1200); // Example world bounds
    this.physics.world.setBounds(0, 0, 1600, 1200);
    this.cameras.main.startFollow(this.player, true, 0.05, 0.05);

    // Input
    this.cursors = this.input.keyboard?.createCursorKeys();

    // Escape key to return to main menu
    this.input.keyboard?.on("keydown-ESC", () => {
      this.scene.start("MainMenuScene");
    });

    // Instructions for visible controls
    this.add
      .text(10, this.cameras.main.height - 60, "Controls: Arrow Keys to Move", {
        font: "14px Arial",
        color: "#ffffff",
      })
      .setScrollFactor(0);
    this.add
      .text(10, this.cameras.main.height - 40, "ESC: Main Menu", {
        font: "14px Arial",
        color: "#ffffff",
      })
      .setScrollFactor(0);
  }

  update(time: number, delta: number) {
    if (!this.player || !this.cursors) {
      return;
    }

    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-160);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(160);
    }
  }
}
