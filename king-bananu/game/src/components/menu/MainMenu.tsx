import React from 'react';
import './MainMenu.css'; // We'll create this CSS file next

interface MainMenuProps {
  onNewGame: () => void;
  // onLoadGame: () => void; // Removed
  // onSettings: () => void; // Placeholder for future settings
}

const MainMenu: React.FC<MainMenuProps> = ({ onNewGame }) => {
  return (
    <div className="main-menu-container">
      <h1 className="game-title">King Bananu</h1>
      <div className="menu-options">
        <button className="menu-button" onClick={onNewGame}>
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
