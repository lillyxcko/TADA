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

export const GestureManager = ({ nodeId, nodeValue, infoIndex, r, activeTouches }) => {
  const touchesByNode = useRef(new Map());

  const resetTouchState = (nodeTouches) => {
    nodeTouches.secondTapPending = false;
    nodeTouches.secondTouchStartTime = null; // Ensure the timer is cleared
  };

  const handleTouchStart = (nodeId, touch) => {
    if (!touchesByNode.current.has(nodeId)) {
      touchesByNode.current.set(nodeId, {
        firstTouch: touch,
        secondTapPending: false,
        isActiveTouch: true,
        secondTouchStartTime: null,
        navInterval: null, // Add navInterval here
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
  
    if (!firstTouch) return;
  
    const distance = getDistance(firstTouch, secondTouch);
    if (distance <= 150) {
      if (nodeTouches.secondTapPending) {
        return; // Prevent duplicate handling
      }
  
      // Start the timer for the second tap
      nodeTouches.secondTouchStartTime = performance.now();
      nodeTouches.secondTapPending = true;
  
      // Continuously check duration
      const interval = setInterval(() => {
        const duration = performance.now() - nodeTouches.secondTouchStartTime;
  
        if (duration > 300) {
          if (!nodeTouches.isNavigating) {
            console.log(`Switching to navigation mode for node ${nodeId}`);
            SoundManager.stopNodeSound(nodeId); // Stop the node sound only here
            nodeTouches.isNavigating = true; // Set navigation mode flag
          }
  
          clearInterval(nodeTouches.navInterval); // Stop checking after switching mode
          nodeTouches.navInterval = null; // Reset the interval reference
        }
      }, 50); // Check every 50ms
  
      nodeTouches.navInterval = interval; // Store the interval ID
    }
  };

  const handleTouchEnd = (e) => {
    const secondTouch = e.changedTouches[0];
    const closestNode = findClosestNodeWithinRange(secondTouch);
  
    if (closestNode && touchesByNode.current.has(closestNode)) {
      const nodeTouches = touchesByNode.current.get(closestNode);
      const { secondTapPending, secondTouchStartTime, navInterval, isNavigating } = nodeTouches;
  
      // Clear navigation interval if it exists
      if (navInterval) {
        clearInterval(navInterval);
        nodeTouches.navInterval = null;
      }
  
      if (secondTapPending && secondTouchStartTime) {
        const duration = performance.now() - nodeTouches.secondTouchStartTime;
  
        if (duration < 300) {
          // Second tap ended before 300ms
          console.log(`Second tap ended before 300ms (${duration}ms). Triggering TTS.`);
          if (!isSpeaking && activeTouches.current.size > 0) {
            const textToSpeak = `${nodeValue[infoIndex.current]}. Held for ${duration} milliseconds.`;
            speakValue(textToSpeak);
  
            infoIndex.current = (infoIndex.current + 1) % nodeValue.length;
          }
        } else if (isNavigating) {
          console.log(`Exiting navigation mode for node ${closestNode}`);
          nodeTouches.isNavigating = false; // Reset navigation flag
        }
  
        // Reset the timer and state
        resetTouchState(nodeTouches);
      }
    }
  };

  return { handleTouchStart, handleTouchEnd, handleSecondTouch };
};