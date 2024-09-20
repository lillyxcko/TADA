import React, { useRef, useEffect } from 'react';
import { SoundManager } from './SoundManager'; // Import SoundManager for link sounds

const Link = ({ x1, y1, x2, y2, pitch }) => {
  const isTouchNearRef = useRef(false); // Track if the touch is near the link
  const linkRef = useRef(null);

  // Helper function to calculate the angle between two points
  const calculateAngle = (x1, y1, x2, y2) => {
    return Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
  };

  // Calculate the distance between two points (width of the rectangle)
  const calculateDistance = (x1, y1, x2, y2) => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    const touchX = touch.clientX;
    const touchY = touch.clientY;

    const rect = linkRef.current.getBoundingClientRect();
    const isInside = (
      touchX >= rect.left &&
      touchX <= rect.right &&
      touchY >= rect.top &&
      touchY <= rect.bottom
    );

    if (isInside) {
      console.log("Touch near link detected, playing sound for link");
      SoundManager.startLinkSound(pitch); // Play the sound for the link
      isTouchNearRef.current = true;
    }
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const touchX = touch.clientX;
    const touchY = touch.clientY;

    const rect = linkRef.current.getBoundingClientRect();
    const isInside = (
      touchX >= rect.left &&
      touchX <= rect.right &&
      touchY >= rect.top &&
      touchY <= rect.bottom
    );

    if (isInside && !isTouchNearRef.current) {
      console.log("Touch moved near link, playing sound for link");
      SoundManager.startLinkSound(pitch); // Start sound when touch moves near the link
      isTouchNearRef.current = true;
    } else if (!isInside && isTouchNearRef.current) {
      console.log("Touch moved away from link, stopping sound for link");
      SoundManager.stopLinkSound(); // Stop sound when touch moves away from the link
      isTouchNearRef.current = false;
    }
  };

  const handleTouchEnd = () => {
    SoundManager.stopLinkSound();
    isTouchNearRef.current = false;
  };

  useEffect(() => {
    const handleDocumentTouchMove = (e) => {
      handleTouchMove(e);
    };

    document.addEventListener('touchmove', handleDocumentTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchmove', handleDocumentTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Calculate the properties of the rectangle
  const width = calculateDistance(x1, y1, x2, y2);
  const height = 8; // You can adjust this value for the thickness of the link
  const angle = calculateAngle(x1, y1, x2, y2);
  
  return (
    <rect
      ref={linkRef}
      x={x1}
      y={y1 - height / 2} // Adjust y position to center the rectangle on the line
      width={width}
      height={height}
      fill="white"
      transform={`rotate(${angle} ${x1} ${y1})`} // Rotate to align with the line
    />
  );
};

export default Link;