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
  private targetCard: Card | null = null;
  private playerHealthBar!: Phaser.GameObjects.Rectangle;
  private enemyHealthBar!: Phaser.GameObjects.Rectangle;
  private energyText!: Phaser.GameObjects.Text;
  private gameWidth!: number;
  private gameHeight!: number;
  private cardWidth = 120;
  private cardHeight = 160;

  constructor() {
    super({ key: "CombatScene" });
  }

  init(data: CombatSceneData) {
    this.enemyType = data.enemyType;
    this.onComplete = data.onComplete;
    this.enemyHealth = this.enemyType === CellType.MINIBOSS ? 150 : 100;
    this.initializeDecks();
  }

  private initializeCombat() {
    // Reset combat state
    this.playerHealth = 100;
    this.playerEnergy = this.maxPlayerEnergy;
    this.playerHand = [];
    this.selectedCard = null;
    this.targetCard = null;

    // Initialize enemy based on type
    if (this.enemyType === CellType.MINIBOSS) {
      this.enemyHealth = 150;
      this.enemyCards = this.createMinibossCards();
    } else {
      this.enemyHealth = 100;
      this.enemyCards = this.createRegularEnemyCards();
    }

    // Draw initial hand
    this.drawCards(3);
  }

  private createMinibossCards(): Card[] {
    return [
      {
        id: "boss_strike",
        name: "Devastating Strike",
        attack: 30,
        defense: 0,
        cost: 3,
        description: "Deal massive damage",
      },
      {
        id: "boss_shield",
        name: "Iron Defense",
        attack: 0,
        defense: 25,
        cost: 2,
        description: "Gain significant defense",
      },
    ];
  }

  private createRegularEnemyCards(): Card[] {
    return [
      {
        id: "enemy_strike",
        name: "Enemy Strike",
        attack: 15,
        defense: 0,
        cost: 1,
        description: "Deal damage",
      },
      {
        id: "enemy_block",
        name: "Enemy Block",
        attack: 0,
        defense: 10,
        cost: 1,
        description: "Gain defense",
      },
    ];
  }

  create() {
    this.gameWidth = this.cameras.main.width;
    this.gameHeight = this.cameras.main.height;

    // Initialize combat state
    this.initializeCombat();

    // Create UI elements in proper order and positioning
    this.createBackground();
    this.createHealthBars();
    this.createEnergyDisplay();
    this.createButtons();
    this.createPlayerHand();

    // Apply initial mute state from localStorage
    const isMuted = localStorage.getItem("isMuted") === "true";
    this.sound.setMute(isMuted);

    // Subscribe to mute state changes
    this.game.events.on("mute", (muted: boolean) => {
      this.sound.setMute(muted);
    });
  }

  private createBackground() {
    // Create solid black background
    this.add
      .rectangle(0, 0, this.gameWidth, this.gameHeight, 0x000000)
      .setOrigin(0)
      .setDepth(0);

    // Create combat areas with better contrast and spacing
    // Enemy area (top third)
    this.add
      .rectangle(0, 0, this.gameWidth, this.gameHeight / 3, 0x111111)
      .setOrigin(0)
      .setDepth(1);

    // Player area (bottom third)
    this.add
      .rectangle(
        0,
        this.gameHeight * 0.66,
        this.gameWidth,
        this.gameHeight / 3,
        0x111111
      )
      .setOrigin(0)
      .setDepth(1);

    // Enemy avatar with border (top left)
    this.add.rectangle(80, 80, 100, 100, 0x222222).setDepth(2);
    this.add
      .rectangle(
        80,
        80,
        96,
        96,
        this.enemyType === CellType.MINIBOSS ? 0x8b0000 : 0xff0000
      )
      .setDepth(2);

    // Player avatar with border (bottom left)
    this.add
      .rectangle(80, this.gameHeight - 80, 100, 100, 0x222222)
      .setDepth(2);
    this.add.rectangle(80, this.gameHeight - 80, 96, 96, 0x0000ff).setDepth(2);
  }

  private createHealthBars() {
    // Enemy health bar and text (top area)
    this.add
      .text(180, 50, "Enemy Health:", {
        color: "#ffffff",
        fontSize: "16px",
      })
      .setDepth(2);

    this.add.rectangle(400, 70, 200, 16, 0x666666).setDepth(2);
    this.enemyHealthBar = this.add
      .rectangle(400, 70, 200, 16, 0xff0000)
      .setOrigin(0, 0.5)
      .setDepth(2);

    // Player health bar and text (bottom area)
    this.add
      .text(180, this.gameHeight - 110, "Player Health:", {
        color: "#ffffff",
        fontSize: "16px",
      })
      .setDepth(2);

    this.add
      .rectangle(400, this.gameHeight - 90, 200, 16, 0x666666)
      .setDepth(2);
    this.playerHealthBar = this.add
      .rectangle(400, this.gameHeight - 90, 200, 16, 0x00ff00)
      .setOrigin(0, 0.5)
      .setDepth(2);

    this.updateHealthBars();
  }

  private createEnergyDisplay() {
    this.energyText = this.add
      .text(
        20,
        this.gameHeight - 110,
        `Energy: ${this.playerEnergy}/${this.maxPlayerEnergy}`,
        {
          color: "#00ffff",
          fontSize: "20px",
        }
      )
      .setDepth(2);
  }

  private createButtons() {
    // Create buttons in the middle right area
    const buttonY = this.gameHeight / 2;
    const buttonSpacing = 60;

    // End turn button
    const endTurnButton = this.add
      .rectangle(
        this.gameWidth - 100,
        buttonY - buttonSpacing,
        120,
        40,
        0x4444ff
      )
      .setInteractive()
      .setDepth(2);
    this.add
      .text(this.gameWidth - 140, buttonY - buttonSpacing - 10, "End Turn", {
        color: "#ffffff",
      })
      .setDepth(2);
    endTurnButton.on("pointerdown", () => this.endTurn());

    // Flee button
    const fleeButton = this.add
      .rectangle(
        this.gameWidth - 100,
        buttonY + buttonSpacing,
        120,
        40,
        0xff4444
      )
      .setInteractive()
      .setDepth(2);
    this.add
      .text(this.gameWidth - 120, buttonY + buttonSpacing - 10, "Flee", {
        color: "#ffffff",
      })
      .setDepth(2);
    fleeButton.on("pointerdown", () => this.attemptFlee());
  }

  private createPlayerHand() {
    // Draw initial hand of cards
    this.drawCards(3);
  }

  private createCardSprite(card: Card, index: number) {
    const totalCards = this.playerHand.length;
    const spacing = Math.min(
      this.cardWidth + 20,
      (500 - this.cardWidth) / Math.max(totalCards - 1, 1)
    );
    const startX =
      (this.gameWidth - (spacing * (totalCards - 1) + this.cardWidth)) / 2;
    const x = startX + index * spacing;
    const y = this.gameHeight - 120;

    // Create a container for all card elements
    const container = this.add.container(x, y);
    container.setDepth(2);

    // Create card background with border
    const cardBorder = this.add.rectangle(
      0,
      0,
      this.cardWidth + 4,
      this.cardHeight + 4,
      0x222222
    );
    const cardBg = this.add.rectangle(
      0,
      0,
      this.cardWidth,
      this.cardHeight,
      0x4444aa
    );
    cardBg.setInteractive();

    // Add elements to container
    container.add([cardBorder, cardBg]);

    // Add card text with better contrast and positioning
    const textConfig = {
      color: "#ffffff",
      fontSize: "16px",
      align: "center" as const,
      padding: { x: 4, y: 2 },
    };

    // Title background and text
    const titleBg = this.add.rectangle(
      0,
      -this.cardHeight / 2 + 20,
      this.cardWidth - 10,
      24,
      0x333333
    );
    const titleText = this.add
      .text(0, -this.cardHeight / 2 + 20, card.name, {
        ...textConfig,
        fontSize: "18px",
      })
      .setOrigin(0.5);

    // Stats layout
    const statsY = -20;
    const statsSpacing = 30;

    // Energy cost
    const energyIcon = this.add
      .text(-40, statsY, "⚡", {
        ...textConfig,
        fontSize: "20px",
      })
      .setOrigin(0.5);
    const energyText = this.add
      .text(-20, statsY, `${card.cost}`, textConfig)
      .setOrigin(0.5);

    // Attack
    const attackIcon = this.add
      .text(-40, statsY + statsSpacing, "⚔️", {
        ...textConfig,
        fontSize: "20px",
      })
      .setOrigin(0.5);
    const attackText = this.add
      .text(-20, statsY + statsSpacing, `${card.attack}`, textConfig)
      .setOrigin(0.5);

    // Defense
    const defenseIcon = this.add
      .text(-40, statsY + statsSpacing * 2, "🛡️", {
        ...textConfig,
        fontSize: "20px",
      })
      .setOrigin(0.5);
    const defenseText = this.add
      .text(-20, statsY + statsSpacing * 2, `${card.defense}`, textConfig)
      .setOrigin(0.5);

    // Description background and text
    const descBg = this.add.rectangle(
      0,
      this.cardHeight / 2 - 30,
      this.cardWidth - 10,
      40,
      0x333333
    );
    const descText = this.add
      .text(0, this.cardHeight / 2 - 30, card.description, {
        ...textConfig,
        fontSize: "12px",
        wordWrap: { width: this.cardWidth - 20 },
      })
      .setOrigin(0.5);

    // Add all text elements to container
    container.add([
      titleBg,
      titleText,
      energyIcon,
      energyText,
      attackIcon,
      attackText,
      defenseIcon,
      defenseText,
      descBg,
      descText,
    ]);

    // Card interactions
    cardBg.on("pointerdown", () => this.onCardClick(card));
    cardBg.on("pointerover", () => {
      container.setScale(1.1);
      container.setDepth(4);
    });
    cardBg.on("pointerout", () => {
      container.setScale(1);
      container.setDepth(2);
    });

    // Store container reference for later use
    card.sprite = container as any;
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
        const totalCards = this.playerHand.length;
        const spacing = Math.min(
          this.cardWidth + 20,
          (500 - this.cardWidth) / Math.max(totalCards - 1, 1)
        );
        const startX =
          (this.gameWidth - (spacing * (totalCards - 1) + this.cardWidth)) / 2;
        const x = startX + index * spacing;
        const y = this.gameHeight - 120;
        (card.sprite as Phaser.GameObjects.Container).setPosition(x, y);
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
    this.sound.play("cardPlay", { volume: 0.3 });

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
    if (victory) {
      // Play coin sound for victory rewards
      this.sound.play("coins", { volume: 0.4 });
    }

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
    // Load Kenney's audio assets
    this.load.audio(
      "cardPlay",
      "src/assets/kenney_casino-audio/Audio/card-slide-5.ogg"
    );
    this.load.audio(
      "coins",
      "src/assets/kenney_rpg-audio/Audio/handleCoins.ogg"
    );
  }
}
