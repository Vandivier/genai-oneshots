"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import the Game component with SSR disabled
const Game = dynamic(() => import("./Game"), {
  ssr: false,
});

export default function WizardForm() {
  const [wizardName, setWizardName] = useState("");
  const [isGameStarted, setIsGameStarted] = useState(false);

  const handleNameSubmit = () => {
    if (wizardName.trim() !== "") {
      setIsGameStarted(true);
    } else {
      alert("Please enter your wizard name!");
    }
  };

  if (isGameStarted) {
    return (
      <Game playerName={wizardName} onBack={() => setIsGameStarted(false)} />
    );
  }

  return (
    <>
      <h1 className="text-4xl font-bold mb-4">Wizard Dude</h1>
      <input
        type="text"
        placeholder="Enter your wizard name"
        className="p-2 border border-gray-300 rounded mb-4"
        value={wizardName}
        onChange={(e) => setWizardName(e.target.value)}
      />
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleNameSubmit}
      >
        Start Game
      </button>
    </>
  );
}
