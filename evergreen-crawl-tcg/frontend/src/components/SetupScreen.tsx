import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { gameAPI } from "../services/api";

interface SavedGame {
  id: number;
  username: string;
  created_at: string;
  gold: number;
  level: number;
}

interface SetupScreenProps {
  onGameStart: (playerId: number) => void;
}

export function SetupScreen({ onGameStart }: SetupScreenProps) {
  const [username, setUsername] = useState(() => generateUniqueUsername());
  const [savedGames, setSavedGames] = useState<SavedGame[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  function generateUniqueUsername(): string {
    const adjectives = ["Brave", "Swift", "Clever", "Mighty", "Noble"];
    const nouns = ["Knight", "Wizard", "Rogue", "Warrior", "Mage"];
    const randomNum = Math.floor(Math.random() * 10000);
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adj}${noun}${randomNum}`;
  }

  const refreshSavedGames = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get all player IDs from localStorage
      const savedPlayerIds = Object.keys(localStorage)
        .filter((key) => key.startsWith("player_"))
        .map((key) => parseInt(localStorage.getItem(key) || "0"))
        .filter((id) => !isNaN(id) && id > 0);

      const games: SavedGame[] = [];
      for (const id of savedPlayerIds) {
        try {
          // Get both player info and game state
          const player = await gameAPI.getPlayer(id);
          const gameState = await gameAPI.getGameState(id);

          games.push({
            id,
            username: player.username,
            created_at: player.created_at,
            gold: player.gold,
            level: gameState.active_dungeon?.floor || 1,
          });
        } catch (e) {
          console.error(`Failed to load player ${id}:`, e);
          // Remove invalid saved game
          localStorage.removeItem(`player_${id}`);
        }
      }

      setSavedGames(games);
    } catch (e) {
      console.error("Failed to load saved games:", e);
      setError("Failed to load saved games");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSavedGames();
  }, []);

  const handleCreateGame = async () => {
    if (!username.trim()) {
      setError("Please enter a username");
      return;
    }

    try {
      setError(null);
      const player = await gameAPI.startGame(username);
      localStorage.setItem(`player_${player.id}`, player.id.toString());
      onGameStart(player.id);
    } catch (e) {
      if (e instanceof Error && e.message.includes("Username already exists")) {
        // Generate a new unique username and update the input
        const newUsername = generateUniqueUsername();
        setUsername(newUsername);
        setError("That username was taken. Try the new suggested username!");
        // Refresh saved games to show the existing username
        refreshSavedGames();
      } else {
        setError(e instanceof Error ? e.message : "Failed to create game");
      }
    }
  };

  const handleLoadGame = async (playerId: number) => {
    try {
      setError(null);
      await gameAPI.getPlayer(playerId); // Verify player exists
      onGameStart(playerId);
    } catch (e) {
      setError("Failed to load game");
      // Remove invalid saved game
      localStorage.removeItem(`player_${playerId}`);
      // Refresh saved games list
      refreshSavedGames();
    }
  };

  const handleDeleteGame = async (playerId: number) => {
    try {
      setError(null);
      await gameAPI.deletePlayer(playerId);
      localStorage.removeItem(`player_${playerId}`);
      refreshSavedGames();
    } catch (e) {
      setError("Failed to delete game");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-8">
            Evergreen Crawl TCG
          </h1>
        </div>

        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>
        )}

        {/* Create New Game */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-4">
          <h2 className="text-xl font-semibold text-white">Create New Game</h2>
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError(null); // Clear error when user types
              }}
              className="w-full"
            />
            <Button
              onClick={handleCreateGame}
              className="w-full"
              variant="default"
            >
              Create Game
            </Button>
          </div>
        </div>

        {/* Saved Games */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Saved Games</h2>
            <Button
              onClick={refreshSavedGames}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              Refresh
            </Button>
          </div>
          {isLoading ? (
            <div className="text-gray-400 text-center py-4">Loading...</div>
          ) : savedGames.length > 0 ? (
            <div className="space-y-3">
              {savedGames.map((game) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between bg-gray-700 p-3 rounded"
                >
                  <div className="text-white">
                    <div className="font-medium">{game.username}</div>
                    <div className="text-sm text-gray-400">
                      Level {game.level} • {Math.floor(game.gold)} Gold
                    </div>
                    <div className="text-xs text-gray-500">
                      Created: {new Date(game.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="space-x-2">
                    <Button
                      onClick={() => handleLoadGame(game.id)}
                      variant="secondary"
                      size="sm"
                    >
                      Load
                    </Button>
                    <Button
                      onClick={() => handleDeleteGame(game.id)}
                      variant="destructive"
                      size="sm"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-center py-4">
              No saved games found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
