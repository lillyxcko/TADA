import { useRef } from 'react';

let isSpeaking = false; // Global flag to track if TTS is currently speaking

const speakValue = (text) => {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);

  utterance.onstart = () => {
    isSpeaking = true; // Set speaking flag when TTS starts
  };

  utterance.onend = () => {
    isSpeaking = false; // Reset speaking flag when TTS ends
  };

  synth.speak(utterance);
};

const getDistance = (touch1, touch2) => {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

// GestureManager to handle independent multi-touch interactions per node
export const GestureManager = ({ nodeValue, infoIndex, r }) => {
  const touchesByNode = useRef(new Map()); // Track touches and states by node

  const handleTouchStart = (nodeId, touch) => {
    // Initialize touch state for a node if not present
    if (!touchesByNode.current.has(nodeId)) {
      touchesByNode.current.set(nodeId, {
        firstTouch: touch,
        secondTapPending: false,
        isActiveTouch: true,
      });
    }

    // Set or reset touch states
    const nodeTouches = touchesByNode.current.get(nodeId);
    nodeTouches.firstTouch = touch;
    nodeTouches.secondTapPending = false; // Reset pending second tap state
    infoIndex.current = 0; // Reset index for TTS cycling
  };

  const handleSecondTouch = (nodeId, secondTouch) => {
    const nodeTouches = touchesByNode.current.get(nodeId);
    const { firstTouch } = nodeTouches;

    // Check if second touch is within 200px of the first touch
    if (firstTouch && getDistance(firstTouch, secondTouch) <= 200) {
      nodeTouches.secondTapPending = true; // Mark second tap as pending
    }
  };

  const findClosestNodeWithinRange = (touch) => {
    let closestNodeId = null;
    let minDistance = 200;

    // Find the closest node within a 200px range
    touchesByNode.current.forEach((nodeTouches, nodeId) => {
      const { firstTouch } = nodeTouches;
      const distance = getDistance(firstTouch, touch);

      if (distance <= 200 && distance < minDistance) {
        closestNodeId = nodeId;
        minDistance = distance;
      }
    });

    return closestNodeId;
  };

  const handleTouchEnd = (e) => {
    // Iterate over all ended touches
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const closestNodeId = findClosestNodeWithinRange(touch);

      if (closestNodeId) {
        const nodeTouches = touchesByNode.current.get(closestNodeId);

        // Trigger TTS only if there's an active touch and a pending second tap
        if (nodeTouches?.isActiveTouch && nodeTouches.secondTapPending && !isSpeaking) {
          speakValue(nodeValue[infoIndex.current]);
          infoIndex.current = (infoIndex.current + 1) % nodeValue.length; // Cycle to the next value
          nodeTouches.secondTapPending = false; // Reset pending tap state
        }
      }
    }

    // If no active touches remain, reset states
    if (e.touches.length === 0) {
      touchesByNode.current.forEach((nodeTouches) => {
        nodeTouches.isActiveTouch = false; // Mark no active touch on node
      });
      touchesByNode.current.clear(); // Clear all touch tracking
      infoIndex.current = 0; // Reset TTS index
    }
  };

  return {
    handleTouchStart,
    handleSecondTouch,
    handleTouchEnd,
  };
};