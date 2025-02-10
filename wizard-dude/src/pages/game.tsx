import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";

// Define enemy types with emoji and name
const enemyTypes = [
  { emoji: "👹", name: "Goblin" },
  { emoji: "👻", name: "Specter" },
  { emoji: "😈", name: "Imp" },
  { emoji: "👽", name: "Alien" },
  { emoji: "💀", name: "Skeleton" },
];

// Define spell descriptions (for ability descriptions)
const spellDescriptions = [
  "A basic magic bolt.", // Spell 1 description
  "A stronger arcane missile.", // Spell 2 description
  "Deals frost damage and slows enemy.", // Spell 3 description
];

export default function Game() {
  const router = useRouter();
  const { name } = router.query;
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [gameMessages, setGameMessages] = useState<string[]>([
    "Welcome to Wizard Dude Game!",
  ]);
  const [currentEnemyType, setCurrentEnemyType] = useState<{
    emoji: string;
    name: string;
  } | null>(null);
  const [playerHealth, setPlayerHealth] = useState<number>(100); // Player health
  const [enemyHealth, setEnemyHealth] = useState<number>(80); // Enemy health

  useEffect(() => {
    if (typeof name === "string") {
      setPlayerName(name);
    }
    startNewBattle();
  }, [name]);

  const startNewBattle = () => {
    const randomEnemyType =
      enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    setCurrentEnemyType(randomEnemyType);
    setEnemyHealth(80); // Reset enemy health for new battle
    setGameMessages((prevMessages) => [
      ...prevMessages,
      `A wild ${randomEnemyType.name} (${randomEnemyType.emoji}) appeared!`,
    ]);
  };

  const handleCastSpell = (spellNumber: number) => {
    if (currentEnemyType) {
      const spellName = `Spell ${spellNumber}`; // Or get spell names if you have them
      const damage = spellNumber * 10; // Example damage calculation

      setGameMessages((prevMessages) => [
        ...prevMessages,
        `Wizard ${playerName} casts ${spellName}!`,
        `It hits the ${currentEnemyType.name} for ${damage} damage!`,
      ]);
      setEnemyHealth((currentHealth) => Math.max(0, currentHealth - damage)); // Reduce enemy health

      // Enemy attacks back (simplified)
      const enemyDamage = 15;
      setPlayerHealth((currentHealth) =>
        Math.max(0, currentHealth - enemyDamage)
      ); // Reduce player health
      setGameMessages((prevMessages) => [
        ...prevMessages,
        `${currentEnemyType.name} attacks back for ${enemyDamage} damage!`,
        `Wizard ${playerName} takes damage!`,
      ]);

      // Check for defeat
      if (enemyHealth <= 0) {
        setGameMessages((prevMessages) => [
          ...prevMessages,
          `The ${currentEnemyType.name} is defeated!`,
        ]);
        setCurrentEnemyType(null); // Remove current enemy
        setTimeout(startNewBattle, 1500); // Start new battle after a delay
      }
      if (playerHealth <= 0) {
        setGameMessages((prevMessages) => [
          ...prevMessages,
          `Wizard ${playerName} has been defeated! Game Over!`,
        ]);
        setPlayerHealth(0); // Ensure health is not negative
        // Handle game over logic here (e.g., show leaderboard, try again button)
      }
    } else {
      setGameMessages((prevMessages) => [
        ...prevMessages,
        "No enemy to attack!",
      ]);
    }
  };

  // Calculate health bar widths
  const playerHealthWidth = (playerHealth / 100) * 100; // Assuming max health is 100
  const enemyHealthWidth = (enemyHealth / 80) * 100; // Assuming max enemy health is 80

  return (
    <>
      <Head>
        <title>Wizard Dude - Game</title>
      </Head>
      <main className="flex flex-col items-center min-h-screen bg-gray-200 p-4">
        <h1 className="text-2xl font-bold mb-4">Wizard Dude Game</h1>
        {playerName && <p className="mb-2">Welcome, Wizard {playerName}!</p>}

        {/* Player Health */}
        <div className="w-full max-w-lg mb-2 text-center">
          <span className="font-bold">Your Health:</span> {playerHealth} / 100
          <div className="bg-gray-300 rounded-full h-2 w-full">
            <div
              className="bg-green-500 rounded-full h-2"
              style={{ width: `${playerHealthWidth}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg shadow-md w-full max-w-lg mb-4">
          {/* Game World Area */}
          <div className="h-48 border border-gray-300 rounded relative flex items-center justify-center">
            {/* Wizard Sprite */}
            <Image
              src="/images/wizard-dude.png"
              alt="Wizard Dude"
              width={64}
              height={64}
              className="absolute bottom-0 left-10"
            />
            {/* Enemy Emoji and Health */}
            <div className="absolute bottom-0 right-10 text-center">
              {currentEnemyType && (
                <>
                  <div className="text-8xl mb-2">{currentEnemyType.emoji}</div>
                  <p className="font-bold">{currentEnemyType.name}</p>
                  <div className="w-24 bg-gray-300 rounded-full h-2 mx-auto">
                    <div
                      className="bg-red-500 rounded-full h-2"
                      style={{ width: `${enemyHealthWidth}%` }}
                    ></div>
                  </div>
                  <span className="text-sm">Health: {enemyHealth} / 80</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex space-x-4 mb-4 justify-center">
          {/* Action Buttons with Descriptions */}
          {spellDescriptions.map((description, index) => (
            <div key={index} className="flex flex-col items-center">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-1"
                onClick={() => handleCastSpell(index + 1)}
              >
                Spell {index + 1}
              </button>
              <p className="text-sm text-gray-600">{description}</p>{" "}
              {/* Spell description */}
            </div>
          ))}
        </div>

        <div className="bg-gray-100 p-4 rounded-lg shadow-md w-full max-w-lg">
          {/* Game Messages */}
          <div className="h-24 border border-gray-300 rounded p-2 overflow-y-auto">
            {gameMessages.map((message, index) => (
              <p key={index} className="text-gray-700">
                {message}
              </p>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
