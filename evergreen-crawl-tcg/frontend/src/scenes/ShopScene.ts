import Phaser from "phaser";
import { gameAPI } from "../services/api";

export class ShopScene extends Phaser.Scene {
  private playerId: number = 0;

  constructor() {
    super({ key: "ShopScene" });
  }

  init(data: { playerId: number }) {
    this.playerId = data.playerId;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Add semi-transparent black background
    const bg = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);
    bg.setOrigin(0);

    // Add shop title
    this.add
      .text(width / 2, 50, "Merchant's Shop", {
        fontSize: "32px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Create close button
    const closeButton = this.add
      .rectangle(width - 60, 40, 80, 40, 0x444444)
      .setInteractive();
    this.add
      .text(width - 60, 40, "Close", {
        color: "#ffffff",
      })
      .setOrigin(0.5);

    closeButton.on("pointerdown", () => {
      this.scene.stop();
      this.scene.resume("DungeonScene");
    });

    // Load shop data
    this.loadShopItems();
  }

  private async loadShopItems() {
    try {
      const shop = await gameAPI.getShop(this.playerId);
      const { width, height } = this.cameras.main;
      const startY = 150;
      const spacing = 80;

      // Featured card
      if (shop.featured_card) {
        this.createShopItem(
          width / 2,
          startY,
          "Featured Card",
          shop.featured_card_price,
          () => this.buyItem("featured")
        );
      }

      // Random card
      this.createShopItem(
        width / 2,
        startY + spacing,
        "Random Card",
        shop.random_card_price,
        () => this.buyItem("random")
      );

      // Card pack
      this.createShopItem(
        width / 2,
        startY + spacing * 2,
        "Card Pack",
        shop.pack_price,
        () => this.buyItem("pack")
      );
    } catch (error) {
      console.error("Failed to load shop items:", error);
    }
  }

  private createShopItem(
    x: number,
    y: number,
    name: string,
    price: number,
    onClick: () => void
  ) {
    const button = this.add.rectangle(x, y, 200, 60, 0x444444).setInteractive();
    this.add
      .text(x, y - 10, name, {
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.add
      .text(x, y + 10, `${price} Gold`, {
        color: "#ffdd44",
      })
      .setOrigin(0.5);

    button.on("pointerdown", onClick);
  }

  private async buyItem(type: "featured" | "random" | "pack") {
    try {
      const result = await gameAPI.buyItem(this.playerId, type);
      if (result.success) {
        // Show success message
        const { width, height } = this.cameras.main;
        const text = this.add
          .text(
            width / 2,
            height - 100,
            `Purchased successfully! Gold remaining: ${result.gold_remaining}`,
            {
              color: "#44ff44",
            }
          )
          .setOrigin(0.5);

        // Remove text after 2 seconds
        this.time.delayedCall(2000, () => text.destroy());
      }
    } catch (error) {
      console.error("Failed to buy item:", error);
    }
  }
}