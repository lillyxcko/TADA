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

  const handleSecondTouch = (nodeId, secondTouch) => {
    const nodeTouches = touchesByNode.current.get(nodeId);
    const { firstTouch } = nodeTouches;

    if (firstTouch && getDistance(firstTouch, secondTouch) <= 150) {
      // Reset the timer for a new second tap
      nodeTouches.secondTouchStartTime = performance.now(); // Always reset for every second tap
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

          // Reset second tap state for subsequent taps
          resetTouchState(nodeTouches);
        }
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