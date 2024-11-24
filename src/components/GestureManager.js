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

  const resetTouchState = (nodeTouches) => {
    nodeTouches.secondTapPending = false;
    nodeTouches.secondTouchStartTime = null;
  };

  const handleTouchStart = (nodeId, touch) => {
    if (!touchesByNode.current.has(nodeId)) {
      touchesByNode.current.set(nodeId, {
        firstTouch: touch,
        secondTapPending: false,
        isActiveTouch: true,
        secondTouchStartTime: null,
      });
    }

    const nodeTouches = touchesByNode.current.get(nodeId);
    nodeTouches.firstTouch = touch;
    nodeTouches.secondTapPending = false; // Reset second tap state
  };

  const findClosestNodeWithinRange = (touch) => {
    let closestNodeId = null;
    let minDistance = 150; // Adjust to match the extended radius in handleSecondTouch
  
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
      // If the touch is already being tracked as an ongoing second tap, do nothing
      if (nodeTouches.secondTapPending) {
        return; // Prevent resetting the timer for the same tap
      }
  
      // Otherwise, start tracking this as a new second tap
      nodeTouches.secondTouchStartTime = performance.now(); // Start timing the new second tap
      nodeTouches.secondTapPending = true; // Mark this as a valid second tap
    }
  };

  const handleTouchEnd = (e) => {
    const secondTouch = e.changedTouches[0];
    const closestNode = findClosestNodeWithinRange(secondTouch);
  
    if (closestNode && touchesByNode.current.has(closestNode)) {
      const nodeTouches = touchesByNode.current.get(closestNode);
      const { secondTapPending, secondTouchStartTime } = nodeTouches;
  
      if (secondTapPending && secondTouchStartTime) {
        const duration = Math.round(performance.now() - secondTouchStartTime);
  
        // Trigger TTS only if valid second tap
        if (!isSpeaking && activeTouches.current.size > 0) {
          const textToSpeak = `${nodeValue[infoIndex.current]}. Held for ${duration} milliseconds.`;
          speakValue(textToSpeak);
  
          // Advance to the next value in the array
          infoIndex.current = (infoIndex.current + 1) % nodeValue.length;
        }
  
        // Reset second tap state for subsequent taps
        resetTouchState(nodeTouches);
      }
    }
  
    // Check if all fingers are lifted
    if (e.touches.length === 0) {
      touchesByNode.current.forEach((nodeTouches) => {
        resetTouchState(nodeTouches); // Reset state when no fingers are left on the screen
      });
    }
  };

  return { handleTouchStart, handleTouchEnd, handleSecondTouch };
};