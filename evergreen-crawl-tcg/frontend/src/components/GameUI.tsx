import { Shop } from "./Shop";
import { Navbar } from "./Navbar";

export function GameUI({ playerId }: { playerId: number }) {
  return (
    <div>
      <Navbar playerId={playerId} />
      <div className="grid grid-cols-[1fr,300px]">
        <div>{/* Game canvas goes here */}</div>
        <Shop playerId={playerId} />
      </div>
    </div>
  );
}
