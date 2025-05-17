import React from 'react';

interface MovementControlsProps {
  onMove: (dx: number, dy: number) => void;
  // canMove: (dx: number, dy: number) => boolean; // Optional, for disabling buttons
}

const buttonStyle: React.CSSProperties = {
  padding: '10px 15px',
  margin: '5px',
  fontSize: '16px',
  cursor: 'pointer',
  minWidth: '50px',
};

const MovementControls: React.FC<MovementControlsProps> = ({ onMove }) => {
  return (
    <div style={{ marginTop: '20px', textAlign: 'center' }}>
      <div>
        <button
          style={buttonStyle}
          onClick={() => onMove(0, -1)}
          title="Move Up (W)"
        >
          ↑
        </button>
      </div>
      <div>
        <button
          style={buttonStyle}
          onClick={() => onMove(-1, 0)}
          title="Move Left (A)"
        >
          ←
        </button>
        <button
          style={buttonStyle}
          onClick={() => onMove(1, 0)}
          title="Move Right (D)"
        >
          →
        </button>
      </div>
      <div>
        <button
          style={buttonStyle}
          onClick={() => onMove(0, 1)}
          title="Move Down (S)"
        >
          ↓
        </button>
      </div>
      <p style={{ fontSize: '0.8em' }}>
        Use W, A, S, D keys or click buttons to move.
      </p>
    </div>
  );
};

export default MovementControls;
