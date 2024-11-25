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

  let isSpeaking = false; // Prevent overlapping TTS
  const speakValue = (text) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => (isSpeaking = true);
    utterance.onend = () => (isSpeaking = false);
    synth.speak(utterance);
  };

  // Calculate proximity feedback
  const calculateProximityFeedback = (touch) => {
    let closestLinkDistance = Infinity;
    let closestLink = null;
  
    const svg = document.querySelector('svg'); // Ensure you're using the correct SVG element
    const point = svg.createSVGPoint(); // Create an SVG point for transformations
  
    // Transform touch coordinates
    point.x = touch.x;
    point.y = touch.y;
    const transformedTouch = point.matrixTransform(svg.getScreenCTM().inverse());
  
    links.forEach(({ x1, y1, x2, y2 }) => {
      // Transform link start and end points
      point.x = x1;
      point.y = y1;
      const transformedStart = point.matrixTransform(svg.getScreenCTM().inverse());
  
      point.x = x2;
      point.y = y2;
      const transformedEnd = point.matrixTransform(svg.getScreenCTM().inverse());
  
      // Calculate the closest point on the link to the touch
      const dx = transformedEnd.x - transformedStart.x;
      const dy = transformedEnd.y - transformedStart.y;
      const lengthSquared = dx * dx + dy * dy;
  
      const t = Math.max(
        0,
        Math.min(
          1,
          ((transformedTouch.x - transformedStart.x) * dx +
            (transformedTouch.y - transformedStart.y) * dy) /
            lengthSquared
        )
      );
  
      const closestX = transformedStart.x + t * dx;
      const closestY = transformedStart.y + t * dy;
  
      const distance = Math.sqrt(
        (closestX - transformedTouch.x) ** 2 + (closestY - transformedTouch.y) ** 2
      );
  
      if (distance < closestLinkDistance) {
        closestLinkDistance = distance;
        closestLink = { transformedStart, transformedEnd, closestX, closestY };
      }
    });
  
    const maxDistance = 200; // Maximum distance for proximity feedback
    const volume = Math.max(0, 1 - closestLinkDistance / maxDistance);
  
    console.log(
      `Closest link: Start (${closestLink?.transformedStart.x}, ${closestLink?.transformedStart.y}), End (${closestLink?.transformedEnd.x}, ${closestLink?.transformedEnd.y})`
    );
  
    return { volume };
  };

  const handleTouchMove = (touch) => {
    //if (!isProximityActive.current) return;

    const { clientX: touchX, clientY: touchY } = touch;
    const feedback = calculateProximityFeedback({ x: touchX, y: touchY });

    console.log('Proximity Feedback:', feedback); // Debugging purposes

    if (gainRef.current && oscillatorRef.current) {
      // Continuously update gain and frequency
      gainRef.current.gain.value = feedback.volume; // Immediate change for responsiveness
      oscillatorRef.current.frequency.value = 440 + feedback.frequencyChange;
    }

    lastTouchPositionRef.current = { x: touchX, y: touchY };
  };

  const startProximityMode = () => {
    isProximityActive.current = true;

    if (gainRef.current) {
      gainRef.current.gain.rampTo(0.5, 0.1); // Set default volume
    }
  };

  const stopProximityMode = () => {
    isProximityActive.current = false;
    //speakValue("stopping");
    if (gainRef.current) {
      gainRef.current.gain.rampTo(0, 0.5); // Fade out sound
    }

    lastTouchPositionRef.current = null;
  };

  useImperativeHandle(ref, () => ({
    startProximityMode,
    stopProximityMode,
  }));

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