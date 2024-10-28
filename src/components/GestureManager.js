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

export const GestureManager = ({ nodeValue, infoIndex, r }) => {
  const touchesByNode = useRef(new Map());
  const touchTimeouts = useRef(new Map()); // Store timeout IDs

  const handleTouchStart = (nodeId, touch) => {
    if (!touchesByNode.current.has(nodeId)) {
      touchesByNode.current.set(nodeId, {
        firstTouch: touch,
        secondTapPending: false,
      });
    }

    const nodeTouches = touchesByNode.current.get(nodeId);
    nodeTouches.firstTouch = touch;
    nodeTouches.secondTapPending = false; // Reset state on new touch
    infoIndex.current = 0; // Reset TTS index

    // Start a timeout for quick tap detection
    touchTimeouts.current.set(touch.identifier, setTimeout(() => {
      // If the timeout completes, it means it's a long press
      nodeTouches.longPress = true; // Mark as long press
    }, 300)); // Set duration for long press (e.g., 300ms)
  };

  const handleSecondTouch = (nodeId, secondTouch) => {
    const nodeTouches = touchesByNode.current.get(nodeId);
    const { firstTouch } = nodeTouches;

    if (firstTouch && getDistance(firstTouch, secondTouch) <= 200) {
      nodeTouches.secondTapPending = true; // Mark second tap as pending
    }
  };

  const findClosestNodeWithinRange = (touch) => {
    let closestNodeId = null;
    let minDistance = 200;

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
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const closestNodeId = findClosestNodeWithinRange(touch);
      const nodeTouches = touchesByNode.current.get(closestNodeId);

      // Clear the timeout if touch ends before the long press duration
      const timeoutId = touchTimeouts.current.get(touch.identifier);
      clearTimeout(timeoutId);
      touchTimeouts.current.delete(touch.identifier);

      if (closestNodeId && nodeTouches && !nodeTouches.longPress) {
        if (nodeTouches?.secondTapPending && !isSpeaking) {
          speakValue(nodeValue[infoIndex.current]);
          infoIndex.current = (infoIndex.current + 1) % nodeValue.length; // Cycle through values
          nodeTouches.secondTapPending = false; // Reset pending state
        }
      }

      // Reset long press flag on touch end
      if (nodeTouches) {
        nodeTouches.longPress = false; // Reset after touch ends
      }
    }

    if (e.touches.length === 0) {
      touchesByNode.current.clear();
      infoIndex.current = 0; // Reset TTS index
    }
  };

  return {
    handleTouchStart,
    handleSecondTouch,
    handleTouchEnd,
  };
};

