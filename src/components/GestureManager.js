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
        isSecondTouchActive: false,
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
      nodeTouches.isSecondTouchActive = true;

      const checkDuration = () => {
        if (!nodeTouches.secondTouchStartTime || !nodeTouches.isSecondTouchActive) return;

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
        const duration = performance.now() - nodeTouches.secondTouchStartTime;

        if (duration < 300 && !nodeTouches.isNavigating) {
          // Second tap ended before 300ms
          console.log(`Second tap ended before 300ms (${duration}ms). Triggering TTS.`);
          if (!isSpeaking && activeTouches.current.size > 0) {
            const textToSpeak = `${nodeValue[infoIndex.current]}`;
            speakValue(textToSpeak);

            infoIndex.current = (infoIndex.current + 1) % nodeValue.length;
          }
        } else if (nodeTouches.isNavigating) {
          console.log(`Exiting navigation mode for node ${nodeId}`);
          nodeTouches.isNavigating = false;
          if (proximityRef && proximityRef.current) {
            proximityRef.current.stopProximityMode();
          }
        }

        nodeTouches.secondTouchIdentifier = null;
        nodeTouches.secondTouchStartTime = null;
        nodeTouches.isSecondTouchActive = false;
      }
    }
  };

  return { handleTouchStart, handleTouchMove, handleTouchEnd };
};