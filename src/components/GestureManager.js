// GestureManager.js

import { useRef } from 'react';
import { SoundManager } from './SoundManager';

let isSpeaking = false; // Prevent overlapping TTS

const speakValue = (text) => {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.onstart = () => (isSpeaking = true);
  utterance.onend = () => (isSpeaking = false);
  synth.speak(utterance);
};

const getDistance = (touch1, touch2) => {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

export const GestureManager = ({
  nodeId,
  nodeValue,
  infoIndex,
  r,
  activeTouches,
  proximityRef,
}) => {
  const touchesByNode = useRef(new Map());

  const handleTouchStart = (nodeId, touch) => {
    if (!touchesByNode.current.has(nodeId)) {
      touchesByNode.current.set(nodeId, {
        firstTouch: touch,
        isActiveTouch: true,
        isNavigating: false,
        secondTouchIdentifier: null,
        secondTouchStartTime: null,
      });
    }

    const nodeTouches = touchesByNode.current.get(nodeId);
    nodeTouches.firstTouch = touch;
  };

  const handleSecondTouch = (nodeId, touch) => {
    const nodeTouches = touchesByNode.current.get(nodeId);
    const { firstTouch } = nodeTouches;

    if (!firstTouch) return;

    const distance = getDistance(firstTouch, touch);
    if (distance <= 150) {
      if (nodeTouches.secondTouchIdentifier === touch.identifier) {
        // Already tracking this second touch
        return;
      }

      nodeTouches.secondTouchIdentifier = touch.identifier;
      nodeTouches.secondTouchStartTime = performance.now();

      const checkDuration = () => {
        if (!nodeTouches.secondTouchStartTime) return;

        const duration = performance.now() - nodeTouches.secondTouchStartTime;

        if (duration > 300 && !nodeTouches.isNavigating) {
          console.log(`Switching to navigation mode for node ${nodeId}`);
          SoundManager.stopNodeSound(nodeId);
          if (proximityRef && proximityRef.current) {
            proximityRef.current.startProximityMode();
          }
          nodeTouches.isNavigating = true;
        } else if (!nodeTouches.isNavigating) {
          requestAnimationFrame(checkDuration);
        }
      };

      requestAnimationFrame(checkDuration);
    }
  };

  const handleTouchMove = (e) => {
    for (let touch of e.touches) {
      // Check if the touch is near the first touch
      handleSecondTouch(nodeId, touch);
    }
  };

  const handleTouchEnd = (e) => {
    const nodeTouches = touchesByNode.current.get(nodeId);

    // Remove touches from activeTouches
    for (let touch of e.changedTouches) {
      if (touch.identifier === nodeTouches.secondTouchIdentifier) {
        nodeTouches.secondTouchIdentifier = null;
        nodeTouches.secondTouchStartTime = null;

        if (nodeTouches.isNavigating) {
          console.log(`Exiting navigation mode for node ${nodeId}`);
          nodeTouches.isNavigating = false;
          if (proximityRef && proximityRef.current) {
            proximityRef.current.stopProximityMode();
          }
        }
      }
    }
  };

  return { handleTouchStart, handleTouchMove, handleTouchEnd };
};