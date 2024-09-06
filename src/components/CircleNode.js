import React, { useRef, useEffect } from 'react';

const CircleNode = ({ cx, cy, r, pitch }) => {
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const isInsideRef = useRef(false); // Track if the touch is inside the circle
  const circleRef = useRef(null);

  const initializeAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(err => console.log('AudioContext resume failed', err));
    }
  };

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

  const stopSound = () => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current = null;
    }
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const circle = circleRef.current.getBoundingClientRect();
    const touchX = touch.clientX;
    const touchY = touch.clientY;

    // Check if touch is inside the circle
    const isInside = (
      touchX > circle.left &&
      touchX < circle.right &&
      touchY > circle.top &&
      touchY < circle.bottom
    );

    if (isInside && !isInsideRef.current) {
      console.log('Touch entered the circle');
      startSound();
      isInsideRef.current = true;
    } else if (!isInside && isInsideRef.current) {
      console.log('Touch left the circle');
      stopSound();
      isInsideRef.current = false;
    }
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    const circle = circleRef.current.getBoundingClientRect();
    const touchX = touch.clientX;
    const touchY = touch.clientY;

    // Check if touch starts inside the circle
    const isInside = (
      touchX > circle.left &&
      touchX < circle.right &&
      touchY > circle.top &&
      touchY < circle.bottom
    );

    if (isInside) {
      console.log('Touch started in the circle');
      startSound();
      isInsideRef.current = true;
    } else {
      console.log('Touch started outside the circle');
    }
  };

  const handleTouchEnd = () => {
    stopSound();
    isInsideRef.current = false;
    console.log('Touch ended in the circle');
  };

  useEffect(() => {
    const handleDocumentTouchMove = (e) => {
      handleTouchMove(e);
    };

    const handleDocumentTouchStart = (e) => {
      handleTouchStart(e);
    };

    document.addEventListener('touchmove', handleDocumentTouchMove);
    document.addEventListener('touchstart', handleDocumentTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchmove', handleDocumentTouchMove);
      document.removeEventListener('touchstart', handleDocumentTouchStart);
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
      style={{ cursor: 'pointer' }}
    />
  );
};

export default CircleNode;