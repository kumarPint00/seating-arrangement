import React from 'react';
import './ZoomControls.css';

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  scale: number;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({ 
  onZoomIn, 
  onZoomOut, 
  onReset, 
  scale 
}) => {
  return (
    <div className="zoom-controls">
      <button 
        className="zoom-button zoom-in"
        onClick={onZoomIn}
        aria-label="Zoom in"
        title="Zoom in"
      >
        +
      </button>
      <button 
        className="zoom-button zoom-out"
        onClick={onZoomOut}
        aria-label="Zoom out"  
        title="Zoom out"
      >
        −
      </button>
      <button 
        className="zoom-button zoom-reset"
        onClick={onReset}
        aria-label="Reset zoom"
        title="Reset zoom"
      >
        Reset
      </button>
      <div className="zoom-level">
        {Math.round(scale * 100)}%
      </div>
    </div>
  );
};

export default ZoomControls;