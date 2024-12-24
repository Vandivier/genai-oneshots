import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

export const Shop: React.FC = () => {
  const navigate = useNavigate();
  const progress = JSON.parse(
    localStorage.getItem("gameProgress") || '{"level": 1}'
  );

  const handleContinue = () => {
    // Save any shop purchases and continue to next level
    localStorage.setItem(
      "gameProgress",
      JSON.stringify({
        ...progress,
        shopVisited: true,
      })
    );
    navigate("/");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Shop - Level {progress.level}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Shop items will go here */}
        <div className="p-4 bg-gray-800 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Health Potion</h3>
          <p className="text-gray-300 mb-2">Restore 20 HP</p>
          <p className="text-yellow-400 mb-4">50 Gold</p>
          <Button variant="secondary" className="w-full">
            Buy
          </Button>
        </div>

        <div className="p-4 bg-gray-800 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Basic Card Pack</h3>
          <p className="text-gray-300 mb-2">3 Random Cards</p>
          <p className="text-yellow-400 mb-4">100 Gold</p>
          <Button variant="secondary" className="w-full">
            Buy
          </Button>
        </div>

        <div className="p-4 bg-gray-800 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Rare Card Pack</h3>
          <p className="text-gray-300 mb-2">1 Rare Card</p>
          <p className="text-yellow-400 mb-4">200 Gold</p>
          <Button variant="secondary" className="w-full">
            Buy
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => navigate("/deck-builder")}>
          Edit Deck
        </Button>
        <Button onClick={handleContinue}>
          Continue to Level {progress.level}
        </Button>
      </div>
    </div>
  );
};
