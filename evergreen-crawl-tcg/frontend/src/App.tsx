import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { GameBoard } from "./components/GameBoard";
import { Shop } from "./components/Shop";
import { DeckBuilder } from "./components/DeckBuilder";
import { Navigation } from "./components/Navigation";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient();

const App: React.FC = () => {
  const [playerId, setPlayerId] = useState<number>(0);

  // Get playerId from localStorage on mount
  React.useEffect(() => {
    const savedPlayerId = localStorage.getItem("playerId");
    if (savedPlayerId) {
      const id = parseInt(savedPlayerId, 10);
      // Only set if it's a valid number greater than 0
      if (!isNaN(id) && id > 0) {
        setPlayerId(id);
      } else {
        localStorage.removeItem("playerId");
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-900 text-white">
          <Navigation playerId={playerId} />
          <main className="container mx-auto py-8 px-4">
            <Routes>
              <Route
                path="/"
                element={<GameBoard onPlayerLoad={setPlayerId} />}
              />
              {/* Only render these routes if we have a valid playerId */}
              {playerId > 0 && (
                <>
                  <Route path="/shop" element={<Shop playerId={playerId} />} />
                  <Route
                    path="/deck-builder"
                    element={<DeckBuilder playerId={playerId} />}
                  />
                </>
              )}
            </Routes>
          </main>
          <Toaster position="bottom-right" />
        </div>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
