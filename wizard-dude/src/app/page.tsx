import { Metadata } from "next";
import dynamic from "next/dynamic";
import WizardForm from "./components/WizardForm";

// Dynamically import the Game component with SSR disabled
const Game = dynamic(() => import("./components/Game"), {
  ssr: false,
});

export const metadata: Metadata = {
  title: "Wizard Dude",
  description: "Wizard Dude Game",
};

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <WizardForm />
    </main>
  );
}
