import React from 'react';
import '../App.css'; 

const Overlay = ({ onTouch }) => {
  return (
    <div className="overlay" onTouchStart={onTouch}>
      <p>Tap to start</p>
    </div>
  );
};

export default Overlay;