import React, { useRef, useEffect } from 'react';

const CircleNode = ({ cx, cy, r, pitch }) => {
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const isInsideRef = useRef(false); // Track if the touch is inside the circle
  const circleRef = useRef(null);

  // Initialize AudioContext and resume if necessary
  const initializeAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(err => console.log('AudioContext resume failed', err));
    }
  };

  // Start playing sound
  const startSound = () => {
    initializeAudioContext();
    if (!oscillatorRef.current && audioContextRef.current) {
      const osc = audioContextRef.current.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, audioContextRef.current.currentTime);
      osc.connect(audioContextRef.current.destination);
      osc.start();
      oscillatorRef.current = osc;
    }
  };

  // Stop playing sound
  const stopSound = () => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current = null;
    }
  };

  // Handle when the user moves their finger, simulate entering and leaving the circle
  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const circle = circleRef.current.getBoundingClientRect();
    const touchX = touch.clientX;
    const touchY = touch.clientY;

    const isInside = (
      touchX > circle.left &&
      touchX < circle.right &&
      touchY > circle.top &&
      touchY < circle.bottom
    );

    if (isInside && !isInsideRef.current) {
      startSound();
      isInsideRef.current = true;
    } else if (!isInside && isInsideRef.current) {
      stopSound();
      isInsideRef.current = false;
    }
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    const circle = circleRef.current.getBoundingClientRect();
    const touchX = touch.clientX;
    const touchY = touch.clientY;

    const isInside = (
      touchX > circle.left &&
      touchX < circle.right &&
      touchY > circle.top &&
      touchY < circle.bottom
    );

    if (isInside) {
      startSound();
      isInsideRef.current = true;
    }
  };

  const handleTouchEnd = () => {
    stopSound();
    isInsideRef.current = false;
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

  return (
    <circle
      ref={circleRef}
      cx={cx}
      cy={cy}
      r={r}
      fill="white"
      fillOpacity={0.9}
      onTouchStart={handleTouchStart}
      style={{ cursor: 'pointer' }}
    />
  );
};

export default CircleNode;