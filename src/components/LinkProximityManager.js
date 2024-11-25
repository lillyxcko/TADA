import React, { useEffect, useState, useRef } from 'react';
import * as Tone from 'tone';

const LinkProximity = ({ links, nodeId }) => {
  const [isActive, setIsActive] = useState(false);
  const oscillatorRef = useRef(null);
  const gainRef = useRef(null);

  // Initialize the oscillator and gain node
  useEffect(() => {
    const gain = new Tone.Gain(0).toDestination(); // Start with volume 0
    const oscillator = new Tone.Oscillator({
      type: 'sine', // Oscillator type (can be 'sine', 'square', 'triangle', etc.)
      frequency: 440, // Frequency in Hz
    }).connect(gain);

    oscillator.start();
    oscillatorRef.current = oscillator;
    gainRef.current = gain;

    return () => {
      oscillator.stop();
      oscillator.disconnect();
    };
  }, []);

  // Calculate the volume based on proximity to the nearest link
  const calculateVolume = (touchX, touchY) => {
    let minDistance = Infinity;

    // Loop through all links and calculate the shortest distance to the touch point
    links.forEach((link) => {
      const { x1, y1, x2, y2 } = link;

      const dx = x2 - x1;
      const dy = y2 - y1;
      const lengthSquared = dx * dx + dy * dy;

      const t = Math.max(0, Math.min(1, ((touchX - x1) * dx + (touchY - y1) * dy) / lengthSquared));

      const closestX = x1 + t * dx;
      const closestY = y1 + t * dy;
      const distance = Math.sqrt((closestX - touchX) ** 2 + (closestY - touchY) ** 2);

      minDistance = Math.min(minDistance, distance);
    });

    // Normalize the distance to a volume range (closer = louder)
    const maxDistance = 200; // Define max distance for full volume
    const volume = Math.max(0, 1 - minDistance / maxDistance); // Volume is inversely proportional to distance
    return volume;
  };

  // Handle touch move events
  const handleTouchMove = (e) => {
    if (!isActive) return;

    for (const touch of e.touches) {
      const touchX = touch.clientX;
      const touchY = touch.clientY;

      const volume = calculateVolume(touchX, touchY);
      if (gainRef.current) {
        gainRef.current.gain.rampTo(volume, 0.1); // Smoothly adjust gain
      }
    }
  };

  // Activate proximity mode
  useEffect(() => {
    const handleTouchStart = (e) => {
      if (!isActive) return;

      // Ensure the component responds to touch
      handleTouchMove(e);
    };

    const handleTouchEnd = () => {
      if (gainRef.current) {
        gainRef.current.gain.rampTo(0, 0.5); // Fade out the sound
      }
      setIsActive(false); // Deactivate proximity mode
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isActive]);

  // Triggered externally to activate proximity mode
  const startProximityMode = () => {
    console.log(`Proximity mode activated for node ${nodeId}`);
    setIsActive(true);
  };

  return null; // This component does not render anything directly
};

export default LinkProximity;