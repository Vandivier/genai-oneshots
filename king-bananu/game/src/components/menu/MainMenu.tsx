import React, { useState } from 'react';
import './MainMenu.css'; // We'll create this CSS file next

interface MainMenuProps {
  onNewGame: (seed?: string) => void;
  // onLoadGame: () => void; // Removed
  // onSettings: () => void; // Placeholder for future settings
}

const MainMenu: React.FC<MainMenuProps> = ({ onNewGame }) => {
  const [customSeed, setCustomSeed] = useState<string>('');

  const handleNewGameClick = () => {
    onNewGame(customSeed.trim() || undefined);
  };

  return (
    <div className="main-menu-container">
      <h1 className="game-title">King Bananu</h1>
      <div className="menu-options">
        <div className="seed-input-container">
          <label htmlFor="seedInput" style={{ color: 'black' }}>
            Enter Seed (Optional):
          </label>
          <input
            type="text"
            id="seedInput"
            value={customSeed}
            onChange={(e) => setCustomSeed(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleNewGameClick();
              }
            }}
            placeholder="Leave empty for random seed"
            className="seed-input"
          />
        </div>
        <button className="menu-button" onClick={handleNewGameClick}>
          New Game
        </button>
        {/* <button className="menu-button" onClick={onLoadGame}>
          Load Game
        </button> */}
        {/* <button className="menu-button" onClick={onSettings}>Settings</button> */}
      </div>
    </div>
  );
};

export default MainMenu;
