export const GestureManager = ({ nodeValue, infoIndex }) => {
  const touchesByNode = useRef(new Map());

  const handleTouchStart = (nodeId, touch) => {
    if (!touchesByNode.current.has(nodeId)) {
      touchesByNode.current.set(nodeId, { touches: new Set(), firstTouch: touch, secondTapPending: false });
    }
    const nodeTouches = touchesByNode.current.get(nodeId);
    nodeTouches.touches.add(touch.identifier); // Track touch identifier
    nodeTouches.firstTouch = touch; // Store the first touch for comparison
    infoIndex.current = 0; // Reset the TTS cycle
  };

  const handleSecondTouch = (nodeId, secondTouch) => {
    const nodeTouches = touchesByNode.current.get(nodeId);
    const { firstTouch } = nodeTouches;

    if (firstTouch && getDistance(firstTouch, secondTouch) <= 200) {
      nodeTouches.secondTapPending = true; // Mark second tap as pending
    }
  };

  const handleTouchEnd = (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];

      // Check for pending second taps
      touchesByNode.current.forEach((nodeTouches, nodeId) => {
        if (nodeTouches.touches.has(touch.identifier)) {
          if (nodeTouches.secondTapPending) {
            speakValue(nodeValue[infoIndex.current]); // Speak the value
            infoIndex.current = (infoIndex.current + 1) % nodeValue.length; // Move to the next value
            nodeTouches.secondTapPending = false; // Reset
          }
        }
      });

      // Remove touch from tracking
      touchesByNode.current.forEach((nodeTouches) => {
        nodeTouches.touches.delete(touch.identifier);
      });
    }

    // Clear if no touches remain
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