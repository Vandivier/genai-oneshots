import Phaser from "phaser";
import { PlayerManager } from "./PlayerManager";
import { EnemyManager } from "./EnemyManager";
import { Enemy, PlayerData, Spell } from "./types";

interface GameSceneData {
  playerName: string;
}

class GameScene extends Phaser.Scene {
  private player!: PlayerManager;
  private enemyManager!: EnemyManager;
  private currentEnemy: Enemy | null = null;
  private gameState: "exploring" | "combat" | "levelUp" | "gameOver" =
    "exploring";

  // UI elements
  private playerStatsText!: Phaser.GameObjects.Text;
  private enemyStatsText!: Phaser.GameObjects.Text;
  private actionButtons: Phaser.GameObjects.Text[] = [];
  private messageText!: Phaser.GameObjects.Text;
  private enemyEmoji!: Phaser.GameObjects.Text;

  constructor() {
    super("GameScene");
  }

  init(data: GameSceneData) {
    this.player = new PlayerManager(data.playerName);
    this.enemyManager = new EnemyManager(data.playerName + "_enemies");
  }

  preload() {
    // No need to preload assets when using emojis
  }

  create() {
    this.cameras.main.setBackgroundColor("#1a1a1a"); // Darker background for better contrast
    this.setupUI();
    this.startExploring();
  }

  private setupUI() {
    // Player stats display
    this.playerStatsText = this.add.text(20, 20, "", {
      fontSize: "16px",
      color: "#ffffff",
    });

    // Enemy emoji display (centered, large)
    this.enemyEmoji = this.add
      .text(400, 200, "", {
        fontSize: "64px",
      })
      .setOrigin(0.5);

    // Enemy stats display
    this.enemyStatsText = this.add.text(20, 100, "", {
      fontSize: "16px",
      color: "#ffffff",
    });

    // Message display
    this.messageText = this.add
      .text(400, 300, "", {
        fontSize: "24px",
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);

    this.updateUI();
  }

  private updateUI() {
    const playerData = this.player.getData();
    this.playerStatsText.setText(this.formatPlayerStats(playerData));

    if (this.currentEnemy && this.gameState === "combat") {
      this.enemyStatsText.setText(this.formatEnemyStats(this.currentEnemy));
      this.enemyEmoji.setText(this.currentEnemy.emoji);
    } else {
      this.enemyStatsText.setText("");
      this.enemyEmoji.setText("");
    }
  }

  private formatPlayerStats(data: PlayerData): string {
    return `🧙‍♂️ Wizard ${data.name} (Level ${data.level})
❤️ HP: ${data.hp}/${data.maxHp} | 🌟 MP: ${data.mp}/${data.maxMp}
✨ XP: ${data.experience}/${data.experienceToNextLevel}
⚔️ Attack: ${data.attack} | 🛡️ Defense: ${data.defense}`;
  }

  private formatEnemyStats(enemy: Enemy): string {
    return `${enemy.type}
❤️ HP: ${enemy.hp}/${enemy.maxHp}
📊 Level: ${enemy.level}`;
  }

  private startExploring() {
    this.gameState = "exploring";
    this.clearActionButtons();

    // Add explore button
    const exploreButton = this.add
      .text(400, 400, "Explore", {
        fontSize: "24px",
        color: "#ffffff",
        backgroundColor: "#4a4a4a",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setInteractive()
      .on("pointerdown", () => this.explore());

    this.actionButtons.push(exploreButton);
  }

  private explore() {
    const playerData = this.player.getData();
    this.currentEnemy = this.enemyManager.generateEnemy(playerData.level);
    this.startCombat();
  }

  private startCombat() {
    this.gameState = "combat";
    this.clearActionButtons();
    this.setupCombatButtons();
    this.updateUI();
  }

  private setupCombatButtons() {
    const playerData = this.player.getData();
    const yStart = 400;
    const spacing = 40;

    // Attack button
    this.actionButtons.push(
      this.add
        .text(400, yStart, "Attack", {
          fontSize: "20px",
          color: "#ffffff",
          backgroundColor: "#4a4a4a",
          padding: { x: 10, y: 5 },
        })
        .setOrigin(0.5)
        .setInteractive()
        .on("pointerdown", () => this.handleAttack())
    );

    // Spell buttons
    playerData.spells.forEach((spell, index) => {
      const spellButton = this.add
        .text(
          400,
          yStart + (index + 1) * spacing,
          `${spell.name} (${spell.mpCost} MP)`,
          {
            fontSize: "20px",
            color: "#ffffff",
            backgroundColor: "#4a4a4a",
            padding: { x: 10, y: 5 },
          }
        )
        .setOrigin(0.5)
        .setInteractive()
        .on("pointerdown", () => this.handleSpell(spell));

      this.actionButtons.push(spellButton);
    });

    // Item button if player has items
    if (playerData.items.length > 0) {
      const itemButton = this.add
        .text(
          400,
          yStart + (playerData.spells.length + 1) * spacing,
          "Use Item",
          {
            fontSize: "20px",
            color: "#ffffff",
            backgroundColor: "#4a4a4a",
            padding: { x: 10, y: 5 },
          }
        )
        .setOrigin(0.5)
        .setInteractive()
        .on("pointerdown", () => this.handleUseItem());

      this.actionButtons.push(itemButton);
    }
  }

  private handleAttack() {
    if (!this.currentEnemy) return;

    const damage = this.enemyManager.calculateDamage(
      this.player.getData(),
      this.currentEnemy
    );

    this.currentEnemy.hp -= damage;
    this.showMessage(`⚔️ You dealt ${damage} damage!`);
    this.flashEnemy();

    if (this.currentEnemy.hp <= 0) {
      this.handleEnemyDefeat();
    } else {
      this.handleEnemyTurn();
    }
  }

  private handleSpell(spell: Spell) {
    if (!this.currentEnemy) return;

    if (!this.player.useMp(spell.mpCost)) {
      this.showMessage("⚠️ Not enough MP!");
      return;
    }

    const damage = Math.floor(
      spell.damage * (1 + this.player.getData().level * 0.1)
    );
    this.currentEnemy.hp -= damage;

    // Show spell effect with appropriate emoji
    const spellEmoji = this.getSpellEmoji(spell.element);
    this.showMessage(`${spellEmoji} ${spell.name} deals ${damage} damage!`);
    this.flashEnemy();

    if (this.currentEnemy.hp <= 0) {
      this.handleEnemyDefeat();
    } else {
      this.handleEnemyTurn();
    }
  }

  private getSpellEmoji(element: Spell["element"]): string {
    const elementEmojis = {
      fire: "🔥",
      ice: "❄️",
      lightning: "⚡",
      earth: "🌋",
    };
    return elementEmojis[element];
  }

  private flashEnemy() {
    this.tweens.add({
      targets: this.enemyEmoji,
      alpha: { from: 0.3, to: 1 },
      duration: 200,
      ease: "Power2",
    });
  }

  private handleUseItem() {
    // TODO: Implement item selection and use
  }

  private handleEnemyTurn() {
    if (!this.currentEnemy) return;

    const damage = this.enemyManager.calculateDamage(
      this.currentEnemy,
      this.player.getData()
    );

    this.player.takeDamage(damage);
    this.showMessage(`${this.currentEnemy.type} deals ${damage} damage!`);

    if (this.player.getData().hp <= 0) {
      this.handleGameOver();
    }

    this.updateUI();
  }

  private handleEnemyDefeat() {
    if (!this.currentEnemy) return;

    const rewards = this.currentEnemy.rewards;
    this.showMessage(
      `🎉 ${this.currentEnemy.type} defeated! Gained ${rewards.experience} XP!`
    );

    if (this.player.gainExperience(rewards.experience)) {
      this.handleLevelUp();
    }

    if (rewards.items) {
      rewards.items.forEach((item) => {
        this.player.addItem(item);
        this.showMessage(`🎁 Got ${item.emoji} ${item.name}!`);
      });
    }

    this.currentEnemy = null;
    this.startExploring();
  }

  private handleLevelUp() {
    const playerData = this.player.getData();
    this.showMessage(`🌟 Level Up! You are now level ${playerData.level}!`);
  }

  private handleGameOver() {
    this.gameState = "gameOver";
    this.clearActionButtons();

    this.showMessage("💀 Game Over!");

    // Add restart button
    const restartButton = this.add
      .text(400, 450, "🔄 Try Again", {
        fontSize: "24px",
        color: "#ffffff",
        backgroundColor: "#4a4a4a",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setInteractive()
      .on("pointerdown", () => this.scene.restart());

    this.actionButtons.push(restartButton);
  }

  private showMessage(message: string) {
    this.messageText.setText(message);

    // Flash the message text
    this.tweens.add({
      targets: this.messageText,
      alpha: { from: 1, to: 0 },
      duration: 2000,
      ease: "Power2",
    });
  }

  private clearActionButtons() {
    this.actionButtons.forEach((button) => button.destroy());
    this.actionButtons = [];
  }
}

export default GameScene;
