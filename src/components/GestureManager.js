import { useRef } from 'react';

let isSpeaking = false;

const speakValue = (text) => {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.onstart = () => isSpeaking = true;
  utterance.onend = () => isSpeaking = false;
  synth.speak(utterance);
};

const getDistance = (touch1, touch2) => {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

export const GestureManager = ({ nodeId, nodeValue, infoIndex, r, activeTouches }) => {
  const touchesByNode = useRef(new Map());
  const MOVEMENT_THRESHOLD = 10; // Allowable movement in pixels for a tap

  const handleTouchStart = (nodeId, touch) => {
    // Initialize touch tracking for this node if not already present
    if (!touchesByNode.current.has(nodeId)) {
      touchesByNode.current.set(nodeId, new Map());
    }

    const nodeTouches = touchesByNode.current.get(nodeId);

    // Track this specific touch
    nodeTouches.set(touch.identifier, {
      firstTouch: { clientX: touch.clientX, clientY: touch.clientY },
      secondTapPending: false,
      isActiveTouch: true,
      secondTouchStartTime: null,
    });
  };

  const handleSecondTouch = (nodeId, secondTouch) => {
    const nodeTouches = touchesByNode.current.get(nodeId);
    if (!nodeTouches) return;

    const touchData = [...nodeTouches.values()].find(({ firstTouch }) => {
      return getDistance(firstTouch, secondTouch) <= 150; // Check proximity
    });

    if (touchData) {
      touchData.secondTapPending = true;
      touchData.secondTouchStartTime = performance.now(); // Record the second touch time
    }
  };

  const handleTouchMove = (nodeId, touch) => {
    const nodeTouches = touchesByNode.current.get(nodeId);
    if (!nodeTouches) return;

    const touchData = nodeTouches.get(touch.identifier);
    if (!touchData) return;

    const { firstTouch } = touchData;
    const distanceMoved = getDistance(firstTouch, { clientX: touch.clientX, clientY: touch.clientY });

    // If movement exceeds the threshold, mark this touch as inactive for a tap
    if (distanceMoved > MOVEMENT_THRESHOLD) {
      touchData.isActiveTouch = false;
    }
  };

  const handleTouchEnd = (e) => {
    const secondTouch = e.changedTouches[0];

    touchesByNode.current.forEach((nodeTouches, nodeId) => {
      const touchData = nodeTouches.get(secondTouch.identifier);
      if (!touchData) return;

      const { secondTapPending, secondTouchStartTime, isActiveTouch } = touchData;

      // Check if the touch is valid for a tap
      if (secondTapPending && isActiveTouch && !isSpeaking && activeTouches.current.size > 0) {
        const duration = secondTouchStartTime
          ? Math.round(performance.now() - secondTouchStartTime)
          : 0;

        const textToSpeak = `${nodeValue[infoIndex.current]}. Held for ${duration} milliseconds.`;
        speakValue(textToSpeak);

        // Cycle to the next value
        infoIndex.current = (infoIndex.current + 1) % nodeValue.length;
      }

      // Clean up touch tracking for this identifier
      nodeTouches.delete(secondTouch.identifier);

      // If all touches are cleared for this node, reset its state
      if (nodeTouches.size === 0) {
        touchesByNode.current.delete(nodeId);
      }
    });
  };

  return { handleTouchStart, handleSecondTouch, handleTouchMove, handleTouchEnd };
};