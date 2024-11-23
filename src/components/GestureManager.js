import { useRef } from 'react';

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

export const GestureManager = ({ nodeId, nodeValue, infoIndex, r, activeTouches }) => {
  const touchesByNode = useRef(new Map());

  const handleTouchStart = (nodeId, touch) => {
    if (!touchesByNode.current.has(nodeId)) {
      touchesByNode.current.set(nodeId, {
        firstTouch: touch,
        isActiveTouch: true,
        secondTouchStartTime: null,
      });
    }

    const nodeTouches = touchesByNode.current.get(nodeId);
    nodeTouches.firstTouch = touch;
    nodeTouches.isActiveTouch = true;
  };

  const findClosestNodeWithinRange = (touch) => {
    let closestNodeId = null;
    let minDistance = 150; // Adjust to match the extended radius

    touchesByNode.current.forEach((nodeTouches, nodeId) => {
      if (!nodeTouches.isActiveTouch) return;
      const dist = getDistance(nodeTouches.firstTouch, touch);
      if (dist < minDistance) {
        minDistance = dist;
        closestNodeId = nodeId;
      }
    });
    return closestNodeId;
  };

  const handleSecondTouch = (nodeId, secondTouch) => {
    const nodeTouches = touchesByNode.current.get(nodeId);
    const { firstTouch } = nodeTouches;

    if (firstTouch && getDistance(firstTouch, secondTouch) <= 150) {
      if (!nodeTouches.secondTouchStartTime) {
        // Start timing the current second tap
        nodeTouches.secondTouchStartTime = performance.now();
      }
    }
  };

  const handleTouchEnd = (e) => {
    for (const changedTouch of e.changedTouches) {
      const secondTouch = changedTouch;
      const closestNode = findClosestNodeWithinRange(secondTouch);

      if (closestNode && touchesByNode.current.has(closestNode)) {
        const nodeTouches = touchesByNode.current.get(closestNode);
        const { secondTouchStartTime } = nodeTouches;

        if (secondTouchStartTime) {
          const duration = Math.round(performance.now() - secondTouchStartTime);

          // Trigger TTS for this second tap
          if (duration <= 300 && !isSpeaking && activeTouches.current.size > 0) {
            const textToSpeak = `${nodeValue[infoIndex.current]}. Held for ${duration} milliseconds.`;
            speakValue(textToSpeak);

            // Move to the next index in the array
            infoIndex.current = (infoIndex.current + 1) % nodeValue.length;

            // Reset the timer for the next second tap
            nodeTouches.secondTouchStartTime = null;
          }
        }
      }
    }
  };

  return { handleTouchStart, handleTouchEnd, handleSecondTouch };
};