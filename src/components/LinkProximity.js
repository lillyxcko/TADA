import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';

const LinkProximity = ({ links }) => {
  const oscillatorRef = useRef(null);
  const gainRef = useRef(null);

  useEffect(() => {
    const gain = new Tone.Gain(0).toDestination();
    const oscillator = new Tone.Oscillator({
      type: 'sine',
      frequency: 440,
    }).connect(gain);

    oscillator.start();
    oscillatorRef.current = oscillator;
    gainRef.current = gain;

    return () => {
      oscillator.stop();
      oscillator.disconnect();
    };
  }, []);

  const calculateVolume = (touchX, touchY) => {
    let minDistance = Infinity;

    links.forEach(({ x1, y1, x2, y2 }) => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const lengthSquared = dx * dx + dy * dy;
      const t = Math.max(0, Math.min(1, ((touchX - x1) * dx + (touchY - y1) * dy) / lengthSquared));
      const closestX = x1 + t * dx;
      const closestY = y1 + t * dy;
      const distance = Math.sqrt((closestX - touchX) ** 2 + (closestY - touchY) ** 2);
      minDistance = Math.min(minDistance, distance);
    });

    const maxDistance = 200;
    return Math.max(0, 1 - minDistance / maxDistance);
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const volume = calculateVolume(touch.clientX, touch.clientY);
    gainRef.current.gain.rampTo(volume, 0.1);
  };

  useEffect(() => {
    document.addEventListener('touchmove', handleTouchMove);
    return () => document.removeEventListener('touchmove', handleTouchMove);
  }, []);

  return null;
};

export default LinkProximity;