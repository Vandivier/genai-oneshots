import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";

// Define base abilities pool
const baseAbilities = [
  {
    name: "Magic Bolt",
    description: "A basic magic bolt.",
    mpCost: 10,
    damageMultiplier: 1,
  },
  {
    name: "Arcane Missile",
    description: "A stronger arcane missile.",
    mpCost: 20,
    damageMultiplier: 2,
  },
  {
    name: "Frost Nova",
    description: "Deals frost damage and slows enemy.",
    mpCost: 25,
    damageMultiplier: 2.5,
  },
  {
    name: "Fireball",
    description: "A classic fire spell.",
    mpCost: 15,
    damageMultiplier: 1.5,
  },
  {
    name: "Lightning Strike",
    description: "Strikes an enemy with lightning.",
    mpCost: 30,
    damageMultiplier: 3,
  },
];

// Define enemy types with emoji, name, XP value, baseHealth, and baseDamage
const enemyTypes = [
  { emoji: "👹", name: "Goblin", xpValue: 20, baseHealth: 80, baseDamage: 15 },
  { emoji: "👻", name: "Specter", xpValue: 30, baseHealth: 90, baseDamage: 18 },
  { emoji: "😈", name: "Imp", xpValue: 25, baseHealth: 85, baseDamage: 16 },
  { emoji: "👽", name: "Alien", xpValue: 35, baseHealth: 100, baseDamage: 20 },
  {
    emoji: "💀",
    name: "Skeleton",
    xpValue: 28,
    baseHealth: 95,
    baseDamage: 17,
  },
];

// Function to generate a seed
const generateSeed = () => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

// Function to seed the random number generator (simple linear congruential generator for example)
const seededRandom = (seed) => {
  let m_seed = seed % 2147483647;
  if (m_seed <= 0) m_seed += 2147483646;
  return () => {
    m_seed = (m_seed * 16807) % 2147483647;
    return m_seed / 2147483646;
  };
};

// Simple hash function to convert string seed to number (for RNG)
const hashCode = (s) =>
  s.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

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
    xpValue: number;
    baseHealth: number;
    baseDamage: number;
  } | null>(null);
  const [playerHealth, setPlayerHealth] = useState<number>(100);
  const [playerMP, setPlayerMP] = useState<number>(100);
  const [enemyHealth, setEnemyHealth] = useState<number>(80);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [playerLevel, setPlayerLevel] = useState<number>(1);
  const [playerXP, setPlayerXP] = useState<number>(0);
  const [xpToNextLevel, setXpToNextLevel] = useState<number>(100);
  const [seed, setSeed] = useState<string>(""); // Initialize seed to empty string
  const [abilities, setAbilities] = useState([]); // Player abilities
  const [enemyBaseDamage, setEnemyBaseDamage] = useState<number>(15); // Store scaled damage in state
  const [dummyState, setDummyState] = useState(false); // ADD DUMMY STATE

  useEffect(() => {
    if (typeof name === "string") {
      setPlayerName(name);
    }
    // Generate seed and set abilities only on client-side
    const currentSeed = generateSeed();
    setSeed(currentSeed);
    const rng = seededRandom(hashCode(currentSeed)); // Use seed to create RNG
    setAbilities(selectRandomAbilities(baseAbilities, 3, rng)); // Seeded ability selection
  }, [name]); // Empty dependency array ensures this runs only once after mount

  useEffect(() => {
    if (abilities.length > 0) {
      startNewBattle();
    }
  }, [abilities]);

  // Function to select random abilities based on seed
  const selectRandomAbilities = (abilityPool, count, rng) => {
    const selectedAbilities = [];
    const pool = [...abilityPool]; // Create a copy to avoid modifying original

    for (let i = 0; i < count; i++) {
      if (pool.length === 0) break; // In case pool is empty
      const randomIndex = Math.floor(rng() * pool.length); // Use seeded RNG
      selectedAbilities.push(pool.splice(randomIndex, 1)[0]);
    }
    return selectedAbilities;
  };

  const startNewBattle = () => {
    console.log("startNewBattle() function called");
    if (!seed) {
      console.log("startNewBattle() aborted: seed is not set yet");
      return;
    }
    console.log("Seed:", seed);
    const randomValue = Math.random();
    console.log("Random Value (Math.random()):", randomValue);
    const randomIndex = Math.floor(randomValue * enemyTypes.length);
    console.log("Random Index:", randomIndex);
    const randomEnemyType = enemyTypes[randomIndex];
    console.log("Selected Enemy Type:", randomEnemyType);

    setCurrentEnemyType(randomEnemyType);
    console.log("setCurrentEnemyType called with:", randomEnemyType);

    const scaledEnemyHealth =
      randomEnemyType.baseHealth * (1 + (playerLevel - 1) * 0.15);
    const scaledEnemyDamage =
      randomEnemyType.baseDamage * (1 + (playerLevel - 1) * 0.1);

    setEnemyHealth(scaledEnemyHealth);
    console.log("setEnemyHealth called with:", scaledEnemyHealth);
    setEnemyBaseDamage(scaledEnemyDamage);
    console.log("setEnemyBaseDamage called with:", scaledEnemyDamage);

    setPlayerHealth(100);
    setPlayerMP(100);
    setIsGameOver(false);
    setGameMessages((prevMessages) => [
      ...prevMessages,
      `A wild Level ${playerLevel} ${randomEnemyType.name} (${randomEnemyType.emoji}) appeared!`,
    ]);
    console.log("Exiting startNewBattle()");
  };

  const handleCastSpell = (abilityIndex: number) => {
    if (isGameOver) {
      return;
    }
    if (playerHealth <= 0) {
      return;
    }

    const ability = abilities[abilityIndex];
    if (!ability) {
      setGameMessages((prevMessages) => [
        ...prevMessages,
        "Invalid ability selected.",
      ]);
      return;
    }

    if (playerMP < ability.mpCost) {
      setGameMessages((prevMessages) => [
        ...prevMessages,
        `Not enough MP to cast ${ability.name}! (Cost: ${ability.mpCost} MP)`,
      ]);
      return;
    }

    if (currentEnemyType) {
      const spellName = ability.name;
      const damage = ability.damageMultiplier * 10;
      const mpCost = ability.mpCost;

      setPlayerMP((currentMP) => currentMP - mpCost);
      setGameMessages((prevMessages) => [
        ...prevMessages,
        `Wizard ${playerName} casts ${spellName}! (Cost: ${mpCost} MP)`,
        `It hits the Level ${playerLevel} ${currentEnemyType.name} for ${damage} damage!`,
      ]); // Indicate level in message
      setEnemyHealth((currentHealth) => Math.max(0, currentHealth - damage));

      // Enemy attacks back (scaled damage)
      const enemyDamage = enemyBaseDamage; // Use scaled enemy damage from state
      setPlayerHealth((currentHealth) =>
        Math.max(0, currentHealth - enemyDamage)
      );
      setGameMessages((prevMessages) => [
        ...prevMessages,
        `Level ${playerLevel} ${
          currentEnemyType.name
        } attacks back for ${enemyDamage.toFixed(0)} damage!`,
        `Wizard ${playerName} takes damage!`,
      ]); // Indicate level in message

      // Check for defeat
      if (enemyHealth <= 0) {
        const xpGain = currentEnemyType.xpValue;
        setPlayerXP((currentXP) => currentXP + xpGain);
        setGameMessages((prevMessages) => [
          ...prevMessages,
          `The Level ${playerLevel} ${currentEnemyType.name} is defeated!`,
          `Wizard ${playerName} gains ${xpGain} XP!`,
        ]);
        setCurrentEnemyType(null);

        console.log("Enemy defeated, enemyHealth:", enemyHealth);
        console.log("Before setTimeout in handleCastSpell (enemy defeated)");
        setTimeout(() => {
          console.log(
            "Inside setTimeout callback - startNewBattle about to be called (enemy defeated)"
          );
          startNewBattle();
          console.log(
            "Inside setTimeout callback - startNewBattle call finished (enemy defeated)"
          );
          setDummyState((prevState) => !prevState); // FORCE RE-RENDER HERE
          console.log("setDummyState called to force re-render"); // DEBUG: Log dummy state update
        }, 1500);
        console.log("After setTimeout in handleCastSpell (enemy defeated)");
        console.log("Exiting handleCastSpell after enemy defeat");
      }
      if (playerHealth <= 0) {
        console.log("Player Health is <= 0:", playerHealth);
        console.log("isGameOver before setIsGameOver:", isGameOver);
        if (!isGameOver) {
          setGameMessages((prevMessages) => [
            ...prevMessages,
            `Wizard ${playerName} has been defeated! Game Over!`,
          ]);
          setPlayerHealth(0);
          setIsGameOver(true);
          console.log("setIsGameOver(true) called");
          console.log("isGameOver after setIsGameOver:", isGameOver);
        }
      }
    } else {
      setGameMessages((prevMessages) => [
        ...prevMessages,
        "No enemy to attack!",
      ]);
    }
  };

  const levelUpPlayer = () => {
    setPlayerLevel((currentLevel) => currentLevel + 1);
    setPlayerXP((currentXP) => currentXP - xpToNextLevel);
    setXpToNextLevel((currentLevel) => currentLevel * 150);
    setPlayerHealth((currentHealth) => currentHealth + 20);
    setPlayerMP((currentMP) => currentMP + 20);
    setGameMessages((prevMessages) => [
      ...prevMessages,
      `Wizard ${playerName} leveled up to Level ${playerLevel + 1}!`,
    ]);
    setGameMessages((prevMessages) => [
      ...prevMessages,
      `Max Health and MP increased!`,
    ]);
  };

  useEffect(() => {
    if (playerXP >= xpToNextLevel) {
      levelUpPlayer();
    }
  }, [playerXP, xpToNextLevel]);

  // Calculate health and MP bar widths
  const playerHealthWidth = (playerHealth / 100) * 100;
  const playerMPWidth = (playerMP / 100) * 100;
  const enemyHealthWidth = (enemyHealth / 80) * 100;

  console.log("Game component render started"); // DEBUG: Log at start of component render

  return (
    <>
      <Head>
        <title>Wizard Dude - Game</title>
      </Head>
      <main className="flex flex-col items-center min-h-screen bg-gray-200 p-4">
        <h1 className="text-2xl font-bold mb-4">Wizard Dude Game</h1>
        {playerName && <p className="mb-2">Welcome, Wizard {playerName}!</p>}

        {/* Game Over Message */}
        {isGameOver && (
          <div className="w-full max-w-lg mb-4 p-4 bg-red-200 text-red-800 rounded-lg text-center">
            <h2 className="text-xl font-bold mb-2">Game Over! - DEBUG UI</h2>{" "}
            {/* Simplified UI for debugging */}
            <p>Wizard {playerName} has been defeated.</p>
            <p>Seed: {seed}</p>
          </div>
        )}

        {/* Player Stats */}
        <div className="w-full max-w-lg mb-2 text-center">
          <p className="font-bold">Level: {playerLevel}</p>
          <p className="mb-1">
            XP: {playerXP} / {xpToNextLevel}
          </p>
          <span className="font-bold">Health:</span> {playerHealth} / 100
          <div className="bg-gray-300 rounded-full h-2 w-full mb-1">
            <div
              className="bg-green-500 rounded-full h-2"
              style={{ width: `${playerHealthWidth}%` }}
            ></div>
          </div>
          <span className="font-bold">MP:</span> {playerMP} / 100
          <div className="bg-gray-300 rounded-full h-2 w-full">
            <div
              className="bg-blue-500 rounded-full h-2"
              style={{ width: `${playerMPWidth}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">Seed: {seed}</p>{" "}
          {/* Display seed in stats */}
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
          {!abilities.length ? (
            <p>Loading abilities...</p>
          ) : (
            !isGameOver &&
            abilities.map((ability, index) => (
              <div key={index} className="flex flex-col items-center">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-1 disabled:opacity-50"
                  onClick={() => handleCastSpell(index)}
                  disabled={isGameOver || playerMP < ability.mpCost}
                >
                  {ability.name}
                </button>
                <p className="text-sm text-gray-600">
                  {ability.description} (Cost: {ability.mpCost} MP)
                </p>
              </div>
            ))
          )}
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
  console.log("Game component render finished"); // DEBUG: Log at end of component render (approximate)
}
