import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";

export const Navigation: React.FC = () => {
  const location = useLocation();
  const progress = JSON.parse(
    localStorage.getItem("gameProgress") || '{"level": 1}'
  );

  return (
    <nav className="bg-gray-800 p-4">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/">
            <Button variant={location.pathname === "/" ? "default" : "ghost"}>
              Dungeon
            </Button>
          </Link>
          <Link to="/shop">
            <Button
              variant={location.pathname === "/shop" ? "default" : "ghost"}
            >
              Shop
            </Button>
          </Link>
          <Link to="/deck-builder">
            <Button
              variant={
                location.pathname === "/deck-builder" ? "default" : "ghost"
              }
            >
              Deck Builder
            </Button>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-yellow-400">Level {progress.level}</span>
          <span className="text-yellow-400">
            Gold: {progress.playerStats?.gold || 0}
          </span>
        </div>
      </div>
    </nav>
  );
};
