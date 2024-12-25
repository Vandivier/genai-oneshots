import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

interface Card {
  id: string;
  name: string;
  attack: number;
  defense: number;
  cost: number;
  effect?: string;
  description: string;
}

interface DeckBuilderProps {
  playerId: number;
}

export function DeckBuilder({ playerId }: DeckBuilderProps) {
  const navigate = useNavigate();
  const progress = JSON.parse(
    localStorage.getItem("gameProgress") || '{"level": 1}'
  );
  const inventory = progress.inventory || { cards: [] };
  const deck = JSON.parse(localStorage.getItem("playerDeck") || "[]");

  const handleAddToDeck = (card: Card) => {
    const updatedDeck = [...deck, card];
    localStorage.setItem("playerDeck", JSON.stringify(updatedDeck));
  };

  const handleRemoveFromDeck = (cardId: string) => {
    const updatedDeck = deck.filter((card: Card) => card.id !== cardId);
    localStorage.setItem("playerDeck", JSON.stringify(updatedDeck));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Deck Builder</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Available Cards */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Available Cards</h2>
          <div className="space-y-4">
            {inventory.cards.map((card: Card) => (
              <div
                key={card.id}
                className="p-4 bg-gray-800 rounded-lg flex justify-between items-center"
              >
                <div>
                  <h3 className="text-lg font-medium">{card.name}</h3>
                  <p className="text-sm text-gray-300">
                    ATK: {card.attack} | DEF: {card.defense} | Cost: {card.cost}
                  </p>
                  <p className="text-sm text-gray-400">{card.description}</p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => handleAddToDeck(card)}
                  disabled={deck.some((c: Card) => c.id === card.id)}
                >
                  Add to Deck
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Current Deck */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Current Deck</h2>
          <div className="space-y-4">
            {deck.map((card: Card) => (
              <div
                key={card.id}
                className="p-4 bg-gray-700 rounded-lg flex justify-between items-center"
              >
                <div>
                  <h3 className="text-lg font-medium">{card.name}</h3>
                  <p className="text-sm text-gray-300">
                    ATK: {card.attack} | DEF: {card.defense} | Cost: {card.cost}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => handleRemoveFromDeck(card.id)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={() => navigate("/shop")}>
          Back to Shop
        </Button>
        <Button onClick={() => navigate("/")}>
          Start Level {progress.level}
        </Button>
      </div>
    </div>
  );
}
