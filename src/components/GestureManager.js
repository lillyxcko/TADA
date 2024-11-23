import { useRef } from 'react';

let isSpeaking = false;

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
      const duration = performance.now() - firstTouch.timestamp;

      if (duration < 300 && !isSpeaking) {
        const textToSpeak = `${nodeValue[infoIndex.current]}. Gesture detected with multiple fingers.`;
        speakValue(textToSpeak);
        infoIndex.current = (infoIndex.current + 1) % nodeValue.length;
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