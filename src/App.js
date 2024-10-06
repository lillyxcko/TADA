import React, { useEffect, useState } from 'react';
import './App.css';
import Diagram from './components/Diagram';
import Overlay from './components/Overlay';

const App = () => {
  const [overlayVisible, setOverlayVisible] = useState(true); // Initially show the overlay

  const handleTouch = () => {
    setOverlayVisible(false); // Hide overlay on first touch
  };

  useEffect(() => {
    // Disable pinch-to-zoom
    const handleTouchMove = (event) => {
      if (event.scale !== 1) {
        event.preventDefault(); // Prevent the default zoom behavior
      }
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <div className="app-container">
      {overlayVisible && <Overlay onTouch={handleTouch} />}
      <Diagram />
    </div>
  );
};

export default App;