import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as Tone from 'tone';

const LinkProximity = forwardRef(({ links }, ref) => {
  const oscillatorRef = useRef(null);
  const gainRef = useRef(null);
  const lastPositionRef = useRef(null);
  const isProximityActive = useRef(false);

  // Initialize sound system
  useEffect(() => {
    const gain = new Tone.Gain(0).toDestination(); // Start with zero volume
    const oscillator = new Tone.Oscillator({
      type: 'sine',
      frequency: 440, // Default frequency
    }).connect(gain);

    oscillator.start(); // Start the oscillator
    oscillatorRef.current = oscillator;
    gainRef.current = gain;

    // Ensure the Tone context is started
    Tone.start().then(() => {
      console.log('Tone.js audio context started');
    });

    return () => {
      oscillator.stop();
      oscillator.disconnect();
    };
  }, []);

  //tts for debugging
  const speakValue = (text) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
  };

  // Calculate the volume and frequency based on proximity to links
  const calculateProximityFeedback = (touch) => {
    let closestLinkDistance = Infinity;

    links.forEach(({ x1, y1, x2, y2 }) => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const lengthSquared = dx * dx + dy * dy;
      const t = Math.max(0, Math.min(1, ((touch.x - x1) * dx + (touch.y - y1) * dy) / lengthSquared));
      const closestX = x1 + t * dx;
      const closestY = y1 + t * dy;
      const distance = Math.sqrt((closestX - touch.x) ** 2 + (closestY - touch.y) ** 2);

      closestLinkDistance = Math.min(closestLinkDistance, distance);
    });

    const maxDistance = 200; // Maximum distance for proximity feedback
    const volume = Math.max(0, 1 - closestLinkDistance / maxDistance);

    return { volume };
  };

  const handleTouchMove = (touch) => {
    if (!isProximityActive.current) return;

    const { clientX: touchX, clientY: touchY } = touch;
    const feedback = calculateProximityFeedback({ x: touchX, y: touchY });

    console.log('Proximity Feedback:', feedback); // Log feedback for debugging

    if (gainRef.current) {
      gainRef.current.gain.rampTo(feedback.volume, 0.1);
    }
  };

  const startProximityMode = () => {
    speakValue('Starting Proximity Mode');
    isProximityActive.current = true;

    // Ensure oscillator volume starts at a reasonable level
    if (gainRef.current) {
      gainRef.current.gain.rampTo(0.5, 0.1); // Set default volume
    }
  };

  const stopProximityMode = () => {
    speakValue('Stopping Proximity Mode');
    isProximityActive.current = false;

    // Fade out the sound
    if (gainRef.current) {
      gainRef.current.gain.rampTo(0, 0.5);
    }
  };

  // Expose methods to the parent via ref
  useImperativeHandle(ref, () => ({
    startProximityMode,
    stopProximityMode,
  }));

  // Attach a global touchmove listener to track touch movements
  useEffect(() => {
    const handleTouchMoveEvent = (e) => {
      if (e.touches.length > 0) {
        handleTouchMove(e.touches[0]);
      }
    };

    document.addEventListener('touchmove', handleTouchMoveEvent);
    return () => {
      document.removeEventListener('touchmove', handleTouchMoveEvent);
    };
  }, []);

  return null;
});

export default LinkProximity;