import React, { useEffect, useRef } from 'react';
import { SoundManager } from './SoundManager'; // Import the Sound Manager

// Helper function to check if a point (touchX, touchY) is near a line segment
const isTouchNearLink = (x1, y1, x2, y2, touchX, touchY, threshold = 10) => {
  const A = touchX - x1;
  const B = touchY - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const len_sq = C * C + D * D;
  const param = len_sq !== 0 ? dot / len_sq : -1;

  let nearestX, nearestY;

  if (param < 0) {
    nearestX = x1;
    nearestY = y1;
  } else if (param > 1) {
    nearestX = x2;
    nearestY = y2;
  } else {
    nearestX = x1 + param * C;
    nearestY = y1 + param * D;
  }

  const dx = touchX - nearestX;
  const dy = touchY - nearestY;
  return Math.sqrt(dx * dx + dy * dy) < threshold;
};

const Link = ({ x1, y1, x2, y2, thickness }) => {
  const linkRef = useRef(null);

  useEffect(() => {
    const handleTouchMove = (e) => {
      const touch = e.touches[0];
      const touchX = touch.clientX;
      const touchY = touch.clientY;

      if (isTouchNearLink(x1, y1, x2, y2, touchX, touchY, thickness + 10)) {
        SoundManager.startLinkSound('C4'); // Play a pluck sound when the touch is near the link
      }
    };

    document.addEventListener('touchmove', handleTouchMove);
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [x1, y1, x2, y2, thickness]);

  return (
    <line
      ref={linkRef}
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="white"
      fillOpacity={0.95}
      strokeWidth={thickness}
    />
  );
};

export default Link;