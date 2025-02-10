import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const [wizardName, setWizardName] = useState("");
  const router = useRouter();

  const handleNameSubmit = () => {
    if (wizardName.trim() !== "") {
      router.push(`/game?name=${wizardName}`);
    } else {
      alert("Please enter your wizard name!");
    }
  };

  return (
    <>
      <Head>
        <title>Wizard Dude</title>
        <meta name="description" content="Wizard Dude Game" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
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
      </main>
    </>
  );
}
