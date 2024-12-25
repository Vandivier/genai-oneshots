import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { gameAPI, type PlayerResponse } from "../services/api";
import { Button } from "./ui/button";

interface NavigationProps {
  playerId: number;
}

export function Navigation({ playerId }: NavigationProps) {
  const location = useLocation();
  const [playerData, setPlayerData] = useState<PlayerResponse | null>(null);

  const refreshPlayerData = async () => {
    if (playerId > 0) {
      try {
        const data = await gameAPI.getPlayer(playerId);
        setPlayerData(data);
      } catch (error) {
        console.error("Failed to refresh player data:", error);
      }
    } else {
      setPlayerData(null);
    }
  };

  useEffect(() => {
    if (playerId > 0) {
      refreshPlayerData();

      // Listen for both Phaser and custom events
      const handleGameStateChange = (event: CustomEvent) => {
        if (event.detail.type === "playerUpdate") {
          setPlayerData(event.detail.data);
        }
      };

      window.addEventListener(
        "gameStateChanged",
        handleGameStateChange as EventListener
      );

      const game = document.querySelector("canvas")?.parentElement?.__phaser__;
      if (game) {
        game.events.on("playerDataChanged", (data?: PlayerResponse) => {
          if (data) {
            setPlayerData(data);
          } else {
            refreshPlayerData();
          }
        });
      }

      return () => {
        window.removeEventListener(
          "gameStateChanged",
          handleGameStateChange as EventListener
        );
        if (game) {
          game.events.off("playerDataChanged");
        }
      };
    } else {
      setPlayerData(null);
    }
  }, [playerId]);

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
        {playerData && (
          <div className="flex items-center space-x-4">
            <span className="font-medium text-white">
              {playerData.username}
            </span>
            <span className="text-yellow-400">
              Level {playerData.level || 1}
            </span>
            <span className="text-yellow-400">
              Gold: {Math.floor(playerData.gold)}
            </span>
          </div>
        )}
      </div>
    </nav>
  );
}
