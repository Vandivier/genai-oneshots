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
  sprite?: Phaser.GameObjects.Sprite;
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
  private readonly cardWidth = 120;
  private readonly cardHeight = 160;

  constructor() {
    super({ key: "CombatScene" });
  }

  init(data: CombatSceneData) {
    this.enemyType = data.enemyType;
    this.onComplete = data.onComplete;
    this.enemyHealth = this.enemyType === CellType.MINIBOSS ? 150 : 100;
    this.initializeDecks();
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

  create() {
    // Create background
    this.add.rectangle(0, 0, 800, 600, 0x000000, 0.7).setOrigin(0);

    // Create UI elements
    this.createHealthBars();
    this.createEnergyDisplay();
    this.createCardArea();
    this.createButtons();

    // Draw initial hand
    this.drawCards(5);
  }

  private createHealthBars() {
    // Player health bar
    this.add.text(50, 20, "Player Health:", { color: "#ffffff" });
    this.add.rectangle(200, 30, 200, 20, 0x666666);
    this.playerHealthBar = this.add
      .rectangle(200, 30, 200, 20, 0x00ff00)
      .setOrigin(0, 0.5);

    // Enemy health bar
    this.add.text(450, 20, "Enemy Health:", { color: "#ffffff" });
    this.add.rectangle(600, 30, 200, 20, 0x666666);
    this.enemyHealthBar = this.add
      .rectangle(600, 30, 200, 20, 0xff0000)
      .setOrigin(0, 0.5);

    this.updateHealthBars();
  }

  private createEnergyDisplay() {
    this.energyText = this.add.text(
      50,
      50,
      `Energy: ${this.playerEnergy}/${this.maxPlayerEnergy}`,
      {
        color: "#00ffff",
        fontSize: "24px",
      }
    );
  }

  private createCardArea() {
    // Player's hand area
    const handArea = this.add.rectangle(400, 500, 600, 150, 0x333333);
    handArea.setInteractive();

    // Enemy's card area
    this.add.rectangle(400, 100, 600, 150, 0x333333);
  }

  private createButtons() {
    // End turn button
    const endTurnButton = this.add.rectangle(700, 300, 120, 40, 0x4444ff);
    this.add.text(660, 290, "End Turn", { color: "#ffffff" });
    endTurnButton.setInteractive();
    endTurnButton.on("pointerdown", () => this.endTurn());

    // Flee button
    const fleeButton = this.add.rectangle(700, 350, 120, 40, 0xff4444);
    this.add.text(680, 340, "Flee", { color: "#ffffff" });
    fleeButton.setInteractive();
    fleeButton.on("pointerdown", () => this.attemptFlee());
  }

  private drawCards(count: number) {
    for (let i = 0; i < count && this.playerCards.length > 0; i++) {
      const card = this.playerCards.pop()!;
      this.playerHand.push(card);
      this.createCardSprite(card, this.playerHand.length - 1);
    }
    this.arrangeHand();
  }

  private createCardSprite(card: Card, index: number) {
    const x = 200 + index * (this.cardWidth + 10);
    const y = 500;

    // Create card background
    const cardBg = this.add.rectangle(
      x,
      y,
      this.cardWidth,
      this.cardHeight,
      0x4444aa
    );
    cardBg.setInteractive();

    // Add card text
    const style = { color: "#ffffff", fontSize: "16px", align: "center" };
    this.add.text(x - 55, y - 70, card.name, style);
    this.add.text(x - 55, y - 40, `Cost: ${card.cost}`, style);
    this.add.text(x - 55, y - 10, `ATK: ${card.attack}`, style);
    this.add.text(x - 55, y + 20, `DEF: ${card.defense}`, style);
    const descText = this.add.text(x - 55, y + 50, card.description, {
      ...style,
      fontSize: "12px",
      wordWrap: { width: 110 },
    });

    // Make card interactive
    cardBg.on("pointerdown", () => this.onCardClick(card));
    cardBg.on("pointerover", () => {
      cardBg.setScale(1.1);
    });
    cardBg.on("pointerout", () => {
      cardBg.setScale(1);
    });

    card.sprite = cardBg;
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

    // Apply card effects
    if (card.effect === "heal") {
      this.playerHealth = Math.min(100, this.playerHealth + 15);
    } else if (card.effect === "double") {
      this.enemyHealth -= card.attack * 2;
    } else {
      this.enemyHealth -= card.attack;
      this.playerHealth += card.defense;
    }

    // Remove card from hand and destroy sprite
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
    this.onComplete(victory);
    this.scene.stop();
  }
}
