import React, { useEffect } from 'react';
import './App.css';
import Diagram from './components/Diagram';

const App = () => {
  
  useEffect(() => {
    // Disable pinch-to-zoom
    const handleTouchMove = (event) => {
      if (event.scale !== 1) {
        event.preventDefault();  // Prevent the default zoom behavior
      }
    };

    // Attach the event listener when the component mounts
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <div className="app-container">
      <Diagram />
    </div>
  );
};

export default App;