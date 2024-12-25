import { useEffect, useState } from "react";
import { gameAPI, type PlayerResponse } from "../services/api";

export function Navbar({ playerId }: { playerId: number }) {
  const [playerData, setPlayerData] = useState<PlayerResponse | null>(null);

  const refreshPlayerData = async () => {
    // Only fetch if we have a valid playerId
    if (playerId > 0) {
      try {
        const data = await gameAPI.getPlayer(playerId);
        setPlayerData(data);
      } catch (error) {
        console.error("Failed to refresh player data:", error);
      }
    } else {
      // Reset player data if no valid playerId
      setPlayerData(null);
    }
  };

  useEffect(() => {
    refreshPlayerData();

    // Listen for player data changes
    const game = document.querySelector("canvas")?.parentElement?.__phaser__;
    if (game) {
      game.events.on("playerDataChanged", (data?: PlayerResponse) => {
        if (data) {
          setPlayerData(data); // Use provided data if available
        } else {
          refreshPlayerData(); // Otherwise refresh from API
        }
      });
    }

    return () => {
      if (game) {
        game.events.off("playerDataChanged");
      }
    };
  }, [playerId]);

  // Don't render anything if no player data
  if (!playerData) {
    return null;
  }

  return (
    <nav className="flex items-center gap-4 p-4 bg-gray-800 text-white">
      <div className="font-medium">{playerData.username}</div>
      <div>Level: {playerData.level}</div>
      <div>Gold: {Math.floor(playerData.gold)}</div>
    </nav>
  );
}
