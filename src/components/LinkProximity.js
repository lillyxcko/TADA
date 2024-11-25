import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as Tone from 'tone';

const LinkProximity = forwardRef(({ links }, ref) => {
  const oscillatorRef = useRef(null);
  const gainRef = useRef(null);
  const lastTouchPositionRef = useRef(null);
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

  const speakValue = (text) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
  };

  // Calculate the proximity to links and angle differences
  const calculateProximityFeedback = (touch) => {
    let closestLinkDistance = Infinity;
    let closestLinkAngleDiff = 0;
    let closestLink = null;

    links.forEach(({ x1, y1, x2, y2 }) => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const lengthSquared = dx * dx + dy * dy;

      // Calculate the closest point on the line to the touch
      const t = Math.max(0, Math.min(1, ((touch.x - x1) * dx + (touch.y - y1) * dy) / lengthSquared));
      const closestX = x1 + t * dx;
      const closestY = y1 + t * dy;

      const distance = Math.sqrt((closestX - touch.x) ** 2 + (closestY - touch.y) ** 2);
      if (distance < closestLinkDistance) {
        closestLinkDistance = distance;
        closestLink = { x1, y1, x2, y2, closestX, closestY };
      }
    });

    // Calculate rotational feedback based on touch movement
    if (lastTouchPositionRef.current && closestLink) {
      const prevDiff = {
        x: lastTouchPositionRef.current.x - closestLink.closestX,
        y: lastTouchPositionRef.current.y - closestLink.closestY,
      };
      const currDiff = {
        x: touch.x - closestLink.closestX,
        y: touch.y - closestLink.closestY,
      };
      closestLinkAngleDiff = Math.atan2(currDiff.y, currDiff.x) - Math.atan2(prevDiff.y, prevDiff.x);
    }

    const maxDistance = 200; // Maximum distance for proximity feedback
    const volume = Math.max(0, 1 - closestLinkDistance / maxDistance);
    const frequencyChange = closestLinkAngleDiff * 100; // Scale angular changes to frequency

    return { volume, frequencyChange, closestLink };
  };

  const handleTouchMove = (touch) => {
    if (!isProximityActive.current) return;

    const { clientX: touchX, clientY: touchY } = touch;
    const feedback = calculateProximityFeedback({ x: touchX, y: touchY });

    console.log('Proximity Feedback:', feedback); // Debugging purposes

    if (gainRef.current && oscillatorRef.current) {
      gainRef.current.gain.rampTo(feedback.volume, 0.1);
      oscillatorRef.current.frequency.rampTo(440 + feedback.frequencyChange, 0.1);
    }

    lastTouchPositionRef.current = { x: touchX, y: touchY };
  };

  const startProximityMode = () => {
    speakValue('Starting Proximity Mode');
    isProximityActive.current = true;

    if (gainRef.current) {
      gainRef.current.gain.rampTo(0.5, 0.1); // Set default volume
    }
  };

  const stopProximityMode = () => {
    speakValue('Stopping Proximity Mode');
    isProximityActive.current = false;

    if (gainRef.current) {
      gainRef.current.gain.rampTo(0, 0.5); // Fade out sound
    }

    lastTouchPositionRef.current = null;
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