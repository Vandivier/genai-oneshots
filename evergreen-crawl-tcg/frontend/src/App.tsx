import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { GameBoard } from "./components/GameBoard";
import { Shop } from "./components/Shop";
import { DeckBuilder } from "./components/DeckBuilder";
import { Navigation } from "./components/Navigation";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-900 text-white">
          <Navigation />
          <main className="container mx-auto py-8 px-4">
            <Routes>
              <Route path="/" element={<GameBoard />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/deck-builder" element={<DeckBuilder />} />
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
