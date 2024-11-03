import { useRef } from 'react';

let isSpeaking = false; // Global flag to track if TTS is currently speaking

const speakValue = (text) => {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);

  utterance.onstart = () => {
    isSpeaking = true;
  };

  utterance.onend = () => {
    isSpeaking = false;
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

  const handleTouchStart = (nodeId, touch) => {
    if (!touchesByNode.current.has(nodeId)) {
      touchesByNode.current.set(nodeId, {
        firstTouch: touch,
        secondTapPending: false,
        isActiveTouch: true,
      });
    }
    const nodeTouches = touchesByNode.current.get(nodeId);
    nodeTouches.firstTouch = touch;
    nodeTouches.secondTapPending = false;
    infoIndex.current = 0;
  };

  const handleSecondTouch = (nodeId, secondTouch) => {
    const nodeTouches = touchesByNode.current.get(nodeId);
    if (nodeTouches) {
      const { firstTouch } = nodeTouches;
      if (firstTouch && getDistance(firstTouch, secondTouch) <= 200) {
        nodeTouches.secondTapPending = true;
      }
    }
  };

  const handleTouchEnd = (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];

      touchesByNode.current.forEach((nodeTouches, nodeId) => {
        const { firstTouch, secondTapPending } = nodeTouches;
        if (firstTouch && getDistance(firstTouch, touch) <= 200 && secondTapPending && !isSpeaking) {
          speakValue(nodeValue[infoIndex.current]);
          infoIndex.current = (infoIndex.current + 1) % nodeValue.length;
          nodeTouches.secondTapPending = false;
        }
      });
    }

    if (e.touches.length === 0) {
      touchesByNode.current.forEach((nodeTouches) => {
        nodeTouches.isActiveTouch = false;
      });
      touchesByNode.current.clear();
      infoIndex.current = 0;
    }
  };

  return {
    handleTouchStart,
    handleSecondTouch,
    handleTouchEnd,
  };
};