import { useEffect, useState } from "react";
import { gameAPI } from "../services/api";
import { Button } from "./ui/button";
import { toast } from "react-hot-toast";

interface ShopProps {
  playerId: number;
}

export function Shop({ playerId }: ShopProps) {
  const [shopData, setShopData] = useState<{
    featured_card: any;
    featured_card_price: number;
    random_card_price: number;
    pack_price: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadShopData = async () => {
    try {
      const data = await gameAPI.getShop(playerId);
      setShopData(data);
    } catch (error) {
      console.error("Failed to load shop data:", error);
    }
  };

  useEffect(() => {
    if (playerId > 0) {
      loadShopData();
    }
  }, [playerId]);

  const handlePurchase = async (type: "featured" | "random" | "pack") => {
    try {
      setError(null); // Clear any previous errors
      const result = await gameAPI.buyItem(playerId, type);
      if (result.success) {
        // Refresh shop data
        loadShopData();

        // Update player data in Navigation
        const game =
          document.querySelector("canvas")?.parentElement?.__phaser__;
        if (game) {
          game.events.emit("playerDataChanged", result.player_data);
        }

        // Show success message
        const message = `Successfully purchased ${
          type === "pack"
            ? "card pack"
            : type === "featured"
            ? "featured card"
            : "random card"
        }!`;
        toast.success(message);
      }
    } catch (error) {
      console.error("Failed to purchase item:", error);
      // Show error message to user
      if (error instanceof Error && error.message.includes("Not enough gold")) {
        setError("Not enough gold to make this purchase!");
      } else {
        setError("Failed to make purchase. Please try again.");
      }
    }
  };

  if (!shopData) {
    return null;
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-white mb-4">Shop</h2>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {shopData.featured_card && (
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-white mb-2">Featured Card</h3>
          <div className="text-gray-300 mb-2">
            {shopData.featured_card.name} - Power:{" "}
            {shopData.featured_card.power_level}
          </div>
          <Button onClick={() => handlePurchase("featured")} className="w-full">
            Buy for {shopData.featured_card_price} Gold
          </Button>
        </div>
      )}

      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-white mb-2">Random Card</h3>
        <Button onClick={() => handlePurchase("random")} className="w-full">
          Buy for {shopData.random_card_price} Gold
        </Button>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-white mb-2">Card Pack</h3>
        <Button onClick={() => handlePurchase("pack")} className="w-full">
          Buy for {shopData.pack_price} Gold
        </Button>
      </div>
    </div>
  );
}
