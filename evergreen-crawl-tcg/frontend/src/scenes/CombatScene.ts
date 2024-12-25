import Phaser from "phaser";
import { CellType } from "./DungeonScene";

interface CombatSceneData {
  enemyType: CellType;
  onComplete: (result: boolean) => void;
}

interface Card {
  id: string;
  name: string;
  attack: number;
  defense: number;
  cost: number;
  effect?: string;
  sprite?: Phaser.GameObjects.Rectangle;
  description: string;
}

export class CombatScene extends Phaser.Scene {
  private enemyType!: CellType;
  private onComplete!: (result: boolean) => void;
  private playerHealth: number = 100;
  private enemyHealth: number = 100;
  private playerEnergy: number = 3;
  private maxPlayerEnergy: number = 3;
  private playerCards: Card[] = [];
  private enemyCards: Card[] = [];
  private playerHand: Card[] = [];
  private selectedCard: Card | null = null;
  private playerHealthBar!: Phaser.GameObjects.Rectangle;
  private enemyHealthBar!: Phaser.GameObjects.Rectangle;
  private energyText!: Phaser.GameObjects.Text;
  private readonly cardWidth = 100;
  private readonly cardHeight = 140;
  private readonly gameWidth = 800;
  private readonly gameHeight = 600;

  constructor() {
    super({ key: "CombatScene" });
  }

  init(data: CombatSceneData) {
    this.enemyType = data.enemyType;
    this.onComplete = data.onComplete;
    this.enemyHealth = this.enemyType === CellType.MINIBOSS ? 150 : 100;
    this.initializeDecks();
  }

  create() {
    // Create semi-transparent background
    this.add
      .rectangle(0, 0, this.gameWidth, this.gameHeight, 0x000000, 0.7)
      .setOrigin(0);

    // Create combat areas
    this.createCombatAreas();
    this.createHealthBars();
    this.createEnergyDisplay();
    this.createButtons();
    this.drawCards(5);
  }

  private createCombatAreas() {
    // Enemy area (top)
    this.add
      .rectangle(this.gameWidth / 2, 100, 600, 120, 0x333333)
      .setAlpha(0.6);

    // Player area (bottom)
    this.add
      .rectangle(this.gameWidth / 2, this.gameHeight - 100, 600, 120, 0x333333)
      .setAlpha(0.6);

    // Enemy avatar
    const enemyAvatar = this.add.rectangle(
      150,
      100,
      80,
      80,
      this.enemyType === CellType.MINIBOSS ? 0x8b0000 : 0xff0000
    );

    // Player avatar
    const playerAvatar = this.add.rectangle(
      150,
      this.gameHeight - 100,
      80,
      80,
      0x0000ff
    );
  }

  private createHealthBars() {
    // Enemy health bar
    this.add.text(250, 70, "Enemy Health:", {
      color: "#ffffff",
      fontSize: "16px",
    });
    this.add.rectangle(400, 90, 200, 16, 0x666666);
    this.enemyHealthBar = this.add
      .rectangle(400, 90, 200, 16, 0xff0000)
      .setOrigin(0, 0.5);

    // Player health bar
    this.add.text(250, this.gameHeight - 130, "Player Health:", {
      color: "#ffffff",
      fontSize: "16px",
    });
    this.add.rectangle(400, this.gameHeight - 110, 200, 16, 0x666666);
    this.playerHealthBar = this.add
      .rectangle(400, this.gameHeight - 110, 200, 16, 0x00ff00)
      .setOrigin(0, 0.5);

    this.updateHealthBars();
  }

  private createEnergyDisplay() {
    this.energyText = this.add.text(
      20,
      this.gameHeight - 130,
      `Energy: ${this.playerEnergy}/${this.maxPlayerEnergy}`,
      {
        color: "#00ffff",
        fontSize: "20px",
      }
    );
  }

  private createButtons() {
    // End turn button
    const endTurnButton = this.add
      .rectangle(
        this.gameWidth - 100,
        this.gameHeight / 2 - 30,
        120,
        40,
        0x4444ff
      )
      .setInteractive();
    this.add.text(this.gameWidth - 140, this.gameHeight / 2 - 40, "End Turn", {
      color: "#ffffff",
    });
    endTurnButton.on("pointerdown", () => this.endTurn());

    // Flee button
    const fleeButton = this.add
      .rectangle(
        this.gameWidth - 100,
        this.gameHeight / 2 + 30,
        120,
        40,
        0xff4444
      )
      .setInteractive();
    this.add.text(this.gameWidth - 120, this.gameHeight / 2 + 20, "Flee", {
      color: "#ffffff",
    });
    fleeButton.on("pointerdown", () => this.attemptFlee());
  }

  private createCardSprite(card: Card, index: number) {
    const totalCards = this.playerHand.length;
    const spacing = Math.min(
      this.cardWidth + 10,
      (500 - this.cardWidth) / Math.max(totalCards - 1, 1)
    );
    const startX =
      (this.gameWidth - (spacing * (totalCards - 1) + this.cardWidth)) / 2;
    const x = startX + index * spacing;
    const y = this.gameHeight - 100;

    // Create card sprite with frame
    const cardBg = this.add
      .sprite(x, y, "card-frames", 0)
      .setDisplaySize(this.cardWidth, this.cardHeight)
      .setInteractive();

    // Add icons
    this.add
      .sprite(x - 35, y - 50, "icons", 0) // Cost icon
      .setDisplaySize(20, 20);
    this.add
      .sprite(x - 35, y - 20, "icons", 1) // Attack icon
      .setDisplaySize(20, 20);
    this.add
      .sprite(x - 35, y + 10, "icons", 2) // Defense icon
      .setDisplaySize(20, 20);

    // Add card text
    const textConfig = {
      color: "#ffffff",
      fontSize: "14px",
      align: "center" as const,
    };

    this.add.text(x - 15, y - 60, card.name, textConfig);
    this.add.text(x - 15, y - 35, `${card.cost}`, textConfig);
    this.add.text(x - 15, y - 5, `${card.attack}`, textConfig);
    this.add.text(x - 15, y + 25, `${card.defense}`, textConfig);
    this.add.text(x - 40, y + 45, card.description, {
      ...textConfig,
      fontSize: "12px",
      wordWrap: { width: 80 },
    });

    // Card interactions
    cardBg.on("pointerdown", () => this.onCardClick(card));
    cardBg.on("pointerover", () => {
      cardBg.setScale(1.1);
      cardBg.setDepth(1);
    });
    cardBg.on("pointerout", () => {
      cardBg.setScale(1);
      cardBg.setDepth(0);
    });

    card.sprite = cardBg;
  }

  private initializeDecks() {
    // Initialize player's deck
    this.playerCards = [
      {
        id: "slash",
        name: "Slash",
        attack: 15,
        defense: 0,
        cost: 1,
        description: "Deal 15 damage",
      },
      {
        id: "block",
        name: "Block",
        attack: 0,
        defense: 10,
        cost: 1,
        description: "Gain 10 defense",
      },
      {
        id: "heavy_strike",
        name: "Heavy Strike",
        attack: 25,
        defense: 0,
        cost: 2,
        description: "Deal 25 damage",
      },
      {
        id: "heal",
        name: "Heal",
        attack: 0,
        defense: 0,
        cost: 2,
        effect: "heal",
        description: "Restore 15 HP",
      },
      {
        id: "double_strike",
        name: "Double Strike",
        attack: 10,
        defense: 0,
        cost: 2,
        effect: "double",
        description: "Deal 10 damage twice",
      },
    ];

    // Shuffle the deck
    this.playerCards = Phaser.Utils.Array.Shuffle(this.playerCards);
  }

  private drawCards(count: number) {
    for (let i = 0; i < count && this.playerCards.length > 0; i++) {
      const card = this.playerCards.pop()!;
      this.playerHand.push(card);
      this.createCardSprite(card, this.playerHand.length - 1);
    }
    this.arrangeHand();
  }

  private arrangeHand() {
    this.playerHand.forEach((card, index) => {
      if (card.sprite) {
        const x = 200 + index * (this.cardWidth + 10);
        const y = 500;
        card.sprite.setPosition(x, y);
      }
    });
  }

  private onCardClick(card: Card) {
    if (this.playerEnergy >= card.cost) {
      this.useCard(card);
    } else {
      // Visual feedback for not enough energy
      const errorText = this.add.text(400, 300, "Not enough energy!", {
        color: "#ff0000",
        fontSize: "24px",
      });
      this.time.delayedCall(1000, () => errorText.destroy());
    }
  }

  private useCard(card: Card) {
    this.playerEnergy -= card.cost;
    this.energyText.setText(
      `Energy: ${this.playerEnergy}/${this.maxPlayerEnergy}`
    );

    // Play card sound
    this.sound.play("card-play", { volume: 0.6 });

    // Apply card effects with visual feedback
    if (card.effect === "heal") {
      this.playerHealth = Math.min(100, this.playerHealth + 15);
      this.createFloatingText(
        this.gameWidth / 2,
        this.gameHeight - 150,
        "+15 HP",
        "#00ff00"
      );
    } else if (card.effect === "double") {
      this.enemyHealth -= card.attack * 2;
      this.createFloatingText(
        this.gameWidth / 2,
        150,
        `-${card.attack * 2}`,
        "#ff0000"
      );
    } else {
      if (card.attack > 0) {
        this.enemyHealth -= card.attack;
        this.createFloatingText(
          this.gameWidth / 2,
          150,
          `-${card.attack}`,
          "#ff0000"
        );
      }
      if (card.defense > 0) {
        this.playerHealth += card.defense;
        this.createFloatingText(
          this.gameWidth / 2,
          this.gameHeight - 150,
          `+${card.defense}`,
          "#00ff00"
        );
      }
    }

    // Remove and destroy card
    const index = this.playerHand.indexOf(card);
    if (index > -1) {
      this.playerHand.splice(index, 1);
      if (card.sprite) {
        card.sprite.destroy();
      }
    }

    this.arrangeHand();
    this.updateHealthBars();
    this.checkGameState();
  }

  private createFloatingText(
    x: number,
    y: number,
    text: string,
    color: string
  ) {
    const floatingText = this.add
      .text(x, y, text, {
        fontSize: "24px",
        color: color,
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: floatingText,
      y: y - 50,
      alpha: 0,
      duration: 1000,
      ease: "Power2",
      onComplete: () => floatingText.destroy(),
    });
  }

  private updateHealthBars() {
    const playerHealthPercent = this.playerHealth / 100;
    const enemyHealthPercent =
      this.enemyHealth / (this.enemyType === CellType.MINIBOSS ? 150 : 100);

    this.playerHealthBar.setScale(playerHealthPercent, 1);
    this.enemyHealthBar.setScale(enemyHealthPercent, 1);
  }

  private endTurn() {
    // Enemy's turn
    const damage = this.enemyType === CellType.MINIBOSS ? 20 : 15;
    this.playerHealth -= damage;

    // Reset player's energy and draw cards
    this.playerEnergy = this.maxPlayerEnergy;
    this.energyText.setText(
      `Energy: ${this.playerEnergy}/${this.maxPlayerEnergy}`
    );
    this.drawCards(2);

    this.updateHealthBars();
    this.checkGameState();
  }

  private checkGameState() {
    if (this.enemyHealth <= 0) {
      this.endCombat(true);
    } else if (this.playerHealth <= 0) {
      this.endCombat(false);
    }
  }

  private attemptFlee() {
    if (Math.random() > 0.5) {
      this.endCombat(false);
    } else {
      this.playerHealth -= 20;
      this.updateHealthBars();
      this.checkGameState();
    }
  }

  private endCombat(victory: boolean) {
    // Play victory/defeat sound
    this.sound.play(victory ? "victory" : "defeat", { volume: 0.7 });

    // Show result text
    const resultText = this.add
      .text(
        this.gameWidth / 2,
        this.gameHeight / 2,
        victory ? "Victory!" : "Defeat",
        {
          fontSize: "48px",
          color: victory ? "#00ff00" : "#ff0000",
        }
      )
      .setOrigin(0.5);

    // Fade out and end scene
    this.tweens.add({
      targets: resultText,
      alpha: 0,
      duration: 1000,
      ease: "Power2",
      onComplete: () => {
        this.onComplete(victory);
        this.scene.stop();
      },
    });
  }

  preload() {
    // Load card assets
    this.load.spritesheet("card-frames", "assets/sprites/card-frames.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
    this.load.spritesheet("icons", "assets/sprites/icons.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    // Load audio
    this.load.audio("card-play", "assets/audio/card-play.wav");
    this.load.audio("card-draw", "assets/audio/card-draw.wav");
    this.load.audio("victory", "assets/audio/victory.wav");
    this.load.audio("defeat", "assets/audio/defeat.wav");
  }
}
