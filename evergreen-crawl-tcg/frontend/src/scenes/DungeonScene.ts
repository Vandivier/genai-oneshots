import Phaser from "phaser";

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
    // Load assets here
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
      }
    }
  }

  private createPlayer() {
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

    // Check bounds and allow movement
    if (
      newGridX >= 0 &&
      newGridX < this.gridSize &&
      newGridY >= 0 &&
      newGridY < this.gridSize
    ) {
      this.canMove = false;

      // Move player
      this.player.x = newX;
      this.player.y = newY;
      this.updateVisibility();

      // Handle cell event
      const cell = this.cells[newGridY][newGridX];
      this.handleCellEvent(cell);

      // Re-enable movement after a short delay
      this.time.delayedCall(200, () => {
        this.canMove = true;
      });
    }
  }

  private handleCellEvent(cell: Cell) {
    switch (cell.type) {
      case CellType.MONSTER:
      case CellType.MINIBOSS:
        this.startCombat(cell);
        break;
      case CellType.TREASURE:
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
        this.nextLevel();
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
          // Combat won
          cell.type = CellType.EMPTY;
          this.createGrid(); // Refresh grid display
        } else {
          // Combat lost - handle game over or penalties
        }
      },
    });
  }

  private collectTreasure(cell: Cell) {
    // TODO: Implement treasure collection
    cell.type = CellType.EMPTY;
    this.createGrid();
  }

  private triggerTrap(cell: Cell) {
    // TODO: Implement trap effects
    cell.type = CellType.EMPTY;
    this.createGrid();
  }

  private activateShrine(cell: Cell) {
    // TODO: Implement shrine effects
    cell.type = CellType.EMPTY;
    this.createGrid();
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
