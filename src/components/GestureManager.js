import { useRef } from 'react';

let isSpeaking = false; // Flag to ensure TTS doesn't overlap

const speakValue = (text, callback) => {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.onstart = () => (isSpeaking = true);
  utterance.onend = () => {
    isSpeaking = false;
    if (callback) callback();
  };
  synth.speak(utterance);
};

export const GestureManager = ({ nodeId, nodeValue, infoIndex, r, activeTouches }) => {
  const touchesByNode = useRef(new Map()); // Tracks all active touches for each node

  const handleTouchStart = (nodeId, touch) => {
    if (!touchesByNode.current.has(nodeId)) {
      touchesByNode.current.set(nodeId, { activeTouches: new Map(), isActiveTouch: true });
    }

    const nodeTouches = touchesByNode.current.get(nodeId);
    nodeTouches.activeTouches.set(touch.identifier, {
      touch,
      timestamp: performance.now(),
    });
  };

  const handleAdditionalTouch = (nodeId, additionalTouch) => {
    const nodeTouches = touchesByNode.current.get(nodeId);

    if (nodeTouches && nodeTouches.activeTouches.size >= 2) {
      // Perform action for multi-finger gestures
      const touchArray = Array.from(nodeTouches.activeTouches.values());
      const firstTouch = touchArray[0];
      const secondTouch = touchArray[touchArray.length - 1];
      const duration = performance.now() - secondTouch.timestamp; // Duration in milliseconds

      if (!isSpeaking) {
        // Announce the duration of the second tap in milliseconds and the current value
        const textToSpeak = `tap held for ${Math.round(duration)} milliseconds. ${nodeValue[infoIndex.current]}.`;
        speakValue(textToSpeak, () => {
          // Move to the next value after speaking is done
          infoIndex.current = (infoIndex.current + 1) % nodeValue.length;
        });
      }
    }

    nodeTouches.activeTouches.set(additionalTouch.identifier, {
      touch: additionalTouch,
      timestamp: performance.now(),
    });
  };

  const handleTouchMove = (nodeId, touch) => {
    const nodeTouches = touchesByNode.current.get(nodeId);
    if (!nodeTouches) return;

    if (nodeTouches.activeTouches.has(touch.identifier)) {
      nodeTouches.activeTouches.set(touch.identifier, {
        touch,
        timestamp: nodeTouches.activeTouches.get(touch.identifier).timestamp,
      });
    }
  };

  const handleTouchEnd = (e) => {
    for (const changedTouch of e.changedTouches) {
      const { identifier } = changedTouch;

      touchesByNode.current.forEach((nodeTouches, nodeId) => {
        if (nodeTouches.activeTouches.has(identifier)) {
          nodeTouches.activeTouches.delete(identifier);

          if (nodeTouches.activeTouches.size === 0) {
            nodeTouches.isActiveTouch = false;
          }
        }
      });
    }
  };

  return { handleTouchStart, handleTouchEnd, handleAdditionalTouch, handleTouchMove };
};