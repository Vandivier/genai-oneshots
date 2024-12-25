import Phaser from "phaser";
import { playerSprite, tileSprite } from "../assets/base64Assets";

export enum CellType {
  EMPTY = "empty",
  MONSTER = "monster",
  TREASURE = "treasure",
  TRAP = "trap",
  EXIT = "exit",
  MERCHANT = "merchant",
  SHRINE = "shrine",
  MINIBOSS = "miniboss",
  SAFE = "safe",
}

interface Cell {
  x: number;
  y: number;
  type: CellType;
  isVisible: boolean;
  isVisited: boolean;
  data?: any; // For storing cell-specific data like monster stats
}

export class DungeonScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private cells: Cell[][] = [];
  private gridSize = 10;
  private cellSize = 50;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private canMove: boolean = true;
  private cellColors: Record<CellType, number> = {
    [CellType.EMPTY]: 0xeeeeee,
    [CellType.MONSTER]: 0xff0000,
    [CellType.TREASURE]: 0xffd700,
    [CellType.TRAP]: 0xff6600,
    [CellType.EXIT]: 0x00ff00,
    [CellType.MERCHANT]: 0x0000ff,
    [CellType.SHRINE]: 0x800080,
    [CellType.MINIBOSS]: 0x8b0000,
    [CellType.SAFE]: 0x98fb98,
  };

  constructor() {
    super({ key: "DungeonScene" });
  }

  preload() {
    // Create temporary canvas for base64 images
    const playerImg = new Image();
    playerImg.src = playerSprite;
    const playerCanvas = document.createElement("canvas");
    playerCanvas.width = 16;
    playerCanvas.height = 16;
    const playerCtx = playerCanvas.getContext("2d")!;
    playerImg.onload = () => {
      playerCtx.drawImage(playerImg, 0, 0);
    };

    const tilesImg = new Image();
    tilesImg.src = tileSprite;
    const tilesCanvas = document.createElement("canvas");
    tilesCanvas.width = 16;
    tilesCanvas.height = 16;
    const tilesCtx = tilesCanvas.getContext("2d")!;
    tilesImg.onload = () => {
      tilesCtx.drawImage(tilesImg, 0, 0);
    };

    // Add textures once loaded
    this.textures.addCanvas("player", playerCanvas);
    this.textures.addCanvas("tiles", tilesCanvas);

    // Load Kenney's audio assets
    this.load.audio(
      "footstep",
      "src/assets/kenney_rpg-audio/Audio/footstep06.ogg"
    );
    this.load.audio(
      "coins",
      "src/assets/kenney_rpg-audio/Audio/handleCoins.ogg"
    );
  }

  create() {
    // First initialize the grid and create all cells
    this.initializeGrid();
    this.createGrid();

    // Then create the player
    this.createPlayer();

    // Initialize fog of war after grid is created
    this.initializeFog();

    // Set up input last
    this.setupInput();

    // Update visibility after everything is initialized
    this.updateVisibility();

    // Apply initial mute state from localStorage
    const isMuted = localStorage.getItem("isMuted") === "true";
    this.sound.setMute(isMuted);

    // Subscribe to mute state changes
    this.game.events.on("mute", (muted: boolean) => {
      this.sound.setMute(muted);
    });
  }

  private initializeGrid() {
    // Initialize empty grid
    this.cells = Array(this.gridSize)
      .fill(null)
      .map(() =>
        Array(this.gridSize)
          .fill(null)
          .map((_, colIndex) => ({
            type: CellType.EMPTY,
            isVisible: false,
            isVisited: false,
            x: colIndex,
            y: 0,
          }))
      );

    // Update cell coordinates
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        this.cells[y][x] = {
          ...this.cells[y][x],
          x: x,
          y: y,
          type: CellType.EMPTY,
          isVisible: false,
          isVisited: false,
        };
      }
    }

    // Place special cells after grid is fully initialized
    this.placeCellType(CellType.EXIT, 1);
    this.placeCellType(CellType.MONSTER, 10);
    this.placeCellType(CellType.TREASURE, 5);
    this.placeCellType(CellType.TRAP, 3);
    this.placeCellType(CellType.MERCHANT, 2);
    this.placeCellType(CellType.SHRINE, 2);
    this.placeCellType(CellType.MINIBOSS, 1);
    this.placeCellType(CellType.SAFE, 3);
  }

  private placeCellType(type: CellType, count: number) {
    for (let i = 0; i < count; i++) {
      let placed = false;
      while (!placed) {
        const x = Phaser.Math.Between(0, this.gridSize - 1);
        const y = Phaser.Math.Between(0, this.gridSize - 1);
        if (this.cells[y][x].type === CellType.EMPTY) {
          this.cells[y][x].type = type;
          placed = true;
        }
      }
    }
  }

  private createGrid() {
    // Clear existing grid graphics
    this.children.list
      .filter(
        (obj): obj is Phaser.GameObjects.Rectangle =>
          obj instanceof Phaser.GameObjects.Rectangle &&
          obj !== this.player &&
          !obj.getData("isFog")
      )
      .forEach((obj) => obj.destroy());

    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x000000, 0.5);

    // Draw grid lines
    for (let x = 0; x <= this.gridSize; x++) {
      graphics.moveTo(x * this.cellSize, 0);
      graphics.lineTo(x * this.cellSize, this.gridSize * this.cellSize);
    }
    for (let y = 0; y <= this.gridSize; y++) {
      graphics.moveTo(0, y * this.cellSize);
      graphics.lineTo(this.gridSize * this.cellSize, y * this.cellSize);
    }
    graphics.strokePath();

    // Draw cell backgrounds
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const cell = this.cells[y][x];
        const rect = this.add.rectangle(
          x * this.cellSize + this.cellSize / 2,
          y * this.cellSize + this.cellSize / 2,
          this.cellSize - 2,
          this.cellSize - 2,
          this.cellColors[cell.type]
        );
        rect.setData("cellData", cell);
        rect.setDepth(1);
      }
    }

    // Ensure player is on top
    if (this.player) {
      this.player.setDepth(2);
    }
  }

  private createPlayer() {
    // Create simple blue rectangle for player
    this.player = this.add.rectangle(
      this.cellSize / 2,
      this.cellSize / 2,
      this.cellSize * 0.8,
      this.cellSize * 0.8,
      0x0000ff
    );
  }

  private setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();

    // Handle key up events for movement
    this.input.keyboard.on("keyup", (event: KeyboardEvent) => {
      if (!this.canMove) return;

      let dx = 0;
      let dy = 0;

      switch (event.code) {
        case "ArrowLeft":
          dx = -1;
          break;
        case "ArrowRight":
          dx = 1;
          break;
        case "ArrowUp":
          dy = -1;
          break;
        case "ArrowDown":
          dy = 1;
          break;
        default:
          return;
      }

      this.movePlayer(dx, dy);
    });
  }

  private initializeFog() {
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const fog = this.add.rectangle(
          x * this.cellSize + this.cellSize / 2,
          y * this.cellSize + this.cellSize / 2,
          this.cellSize,
          this.cellSize,
          0x000000
        );
        fog.setData("x", x);
        fog.setData("y", y);
        fog.setData("isVisible", false);
        fog.setAlpha(1);
      }
    }
  }

  private updateVisibility() {
    const playerGridX = Math.floor(this.player.x / this.cellSize);
    const playerGridY = Math.floor(this.player.y / this.cellSize);

    // Get all fog rectangles
    const fogRectangles = this.children.list.filter(
      (obj): obj is Phaser.GameObjects.Rectangle =>
        obj instanceof Phaser.GameObjects.Rectangle &&
        obj !== this.player &&
        obj.getData("x") !== undefined
    );

    fogRectangles.forEach((fog) => {
      const fogX = fog.getData("x");
      const fogY = fog.getData("y");

      // Check if coordinates are valid
      if (
        fogX === undefined ||
        fogY === undefined ||
        fogX < 0 ||
        fogX >= this.gridSize ||
        fogY < 0 ||
        fogY >= this.gridSize ||
        !this.cells[fogY] ||
        !this.cells[fogY][fogX]
      ) {
        return;
      }

      const distance = Phaser.Math.Distance.Between(
        playerGridX,
        playerGridY,
        fogX,
        fogY
      );

      if (distance <= 1.5) {
        fog.setAlpha(0);
        fog.setData("isVisible", true);
        this.cells[fogY][fogX].isVisible = true;
        this.cells[fogY][fogX].isVisited = true;
      } else if (this.cells[fogY][fogX].isVisited) {
        fog.setAlpha(0.7);
      } else {
        fog.setAlpha(1);
      }
    });
  }

  private movePlayer(dx: number, dy: number) {
    const newX = this.player.x + dx * this.cellSize;
    const newY = this.player.y + dy * this.cellSize;
    const newGridX = Math.floor(newX / this.cellSize);
    const newGridY = Math.floor(newY / this.cellSize);

    if (
      newGridX >= 0 &&
      newGridX < this.gridSize &&
      newGridY >= 0 &&
      newGridY < this.gridSize
    ) {
      this.canMove = false;

      // Move player with tween
      this.tweens.add({
        targets: this.player,
        x: newX,
        y: newY,
        duration: 200,
        ease: "Power2",
        onComplete: () => {
          this.canMove = true;
          this.updateVisibility();
          const cell = this.cells[newGridY][newGridX];
          this.handleCellEvent(cell);
        },
      });
    }
  }

  private handleCellEvent(cell: Cell) {
    // Don't modify the cell type until after the event is fully handled
    const originalCellType = cell.type;

    switch (originalCellType) {
      case CellType.MONSTER:
      case CellType.MINIBOSS:
        this.startCombat(cell);
        break;
      case CellType.TREASURE:
        this.sound.play("coins", { volume: 0.4 });
        this.collectTreasure(cell);
        break;
      case CellType.TRAP:
        this.triggerTrap(cell);
        break;
      case CellType.MERCHANT:
        this.scene.pause();
        this.scene.launch("ShopScene");
        break;
      case CellType.SHRINE:
        this.activateShrine(cell);
        break;
      case CellType.EXIT:
        this.playDescendingFootsteps(() => this.nextLevel());
        break;
      case CellType.SAFE:
        // Safe tiles don't trigger any events
        break;
      case CellType.EMPTY:
        // Empty tiles don't trigger any events
        break;
    }
  }

  private startCombat(cell: Cell) {
    this.scene.pause();
    this.scene.launch("CombatScene", {
      enemyType: cell.type,
      onComplete: (result: boolean) => {
        this.scene.resume();
        if (result) {
          // Only clear the cell if combat was won
          cell.type = CellType.EMPTY;
          this.createGrid(); // Refresh grid display
        }
        // If combat was lost or fled, keep the monster
      },
    });
  }

  private collectTreasure(cell: Cell) {
    // Get current progress
    const progress = JSON.parse(
      localStorage.getItem("gameProgress") || '{"playerStats":{"gold":0}}'
    );

    // Add random gold amount
    const goldAmount = Phaser.Math.Between(10, 50);
    progress.playerStats.gold = (progress.playerStats.gold || 0) + goldAmount;

    // Save progress
    localStorage.setItem("gameProgress", JSON.stringify(progress));

    // Show floating text
    this.add
      .text(this.player.x, this.player.y - 20, `+${goldAmount} Gold!`, {
        fontSize: "16px",
        color: "#ffd700",
      })
      .setOrigin(0.5)
      .setDepth(3);

    // Clear the cell
    cell.type = CellType.EMPTY;
    this.createGrid();
  }

  private triggerTrap(cell: Cell) {
    // Get current progress
    const progress = JSON.parse(
      localStorage.getItem("gameProgress") || '{"playerStats":{"health":100}}'
    );

    // Deal damage
    const damage = Phaser.Math.Between(5, 15);
    progress.playerStats.health = Math.max(
      0,
      (progress.playerStats.health || 100) - damage
    );

    // Save progress
    localStorage.setItem("gameProgress", JSON.stringify(progress));

    // Show floating text
    this.add
      .text(this.player.x, this.player.y - 20, `-${damage} HP!`, {
        fontSize: "16px",
        color: "#ff0000",
      })
      .setOrigin(0.5)
      .setDepth(3);

    // Clear the cell
    cell.type = CellType.EMPTY;
    this.createGrid();

    // Check if player died from trap
    if (progress.playerStats.health <= 0) {
      this.scene.start("GameOverScene");
    }
  }

  private activateShrine(cell: Cell) {
    // Get current progress
    const progress = JSON.parse(
      localStorage.getItem("gameProgress") ||
        '{"playerStats":{"health":100,"maxHealth":100}}'
    );

    // Random shrine effect
    const effects = [
      { type: "heal", amount: 30, text: "Healed for 30 HP!", color: "#00ff00" },
      {
        type: "maxhp",
        amount: 10,
        text: "Max HP increased by 10!",
        color: "#00ffff",
      },
      { type: "gold", amount: 100, text: "Found 100 Gold!", color: "#ffd700" },
    ];

    const effect = Phaser.Utils.Array.GetRandom(effects);

    // Apply effect
    switch (effect.type) {
      case "heal":
        progress.playerStats.health = Math.min(
          progress.playerStats.maxHealth,
          (progress.playerStats.health || 100) + effect.amount
        );
        break;
      case "maxhp":
        progress.playerStats.maxHealth =
          (progress.playerStats.maxHealth || 100) + effect.amount;
        progress.playerStats.health = progress.playerStats.maxHealth;
        break;
      case "gold":
        progress.playerStats.gold =
          (progress.playerStats.gold || 0) + effect.amount;
        break;
    }

    // Save progress
    localStorage.setItem("gameProgress", JSON.stringify(progress));

    // Show floating text
    this.add
      .text(this.player.x, this.player.y - 20, effect.text, {
        fontSize: "16px",
        color: effect.color,
      })
      .setOrigin(0.5)
      .setDepth(3);

    // Clear the cell
    cell.type = CellType.EMPTY;
    this.createGrid();
  }

  private playDescendingFootsteps(onComplete: () => void) {
    let stepCount = 0;
    const playStep = () => {
      if (stepCount < 4) {
        this.sound.play("footstep", { volume: 0.4 - stepCount * 0.1 });
        stepCount++;
        this.time.delayedCall(200, playStep);
      } else {
        onComplete();
      }
    };
    playStep();
  }

  private nextLevel() {
    // Store current level progress
    const currentProgress = {
      level: this.getCurrentLevel(),
      playerStats: this.getPlayerStats(),
      inventory: this.getInventory(),
    };
    localStorage.setItem("gameProgress", JSON.stringify(currentProgress));

    // Navigate to shop between levels
    window.location.href = "/shop";
  }

  private getCurrentLevel(): number {
    const progress = localStorage.getItem("gameProgress");
    if (progress) {
      return JSON.parse(progress).level + 1;
    }
    return 1;
  }

  private getPlayerStats() {
    // TODO: Implement actual player stats
    return {
      health: 100,
      maxHealth: 100,
      gold: 0,
      experience: 0,
    };
  }

  private getInventory() {
    // TODO: Implement actual inventory
    return {
      cards: [],
      items: [],
    };
  }
}
