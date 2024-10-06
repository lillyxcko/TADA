import React, { useRef, useEffect, useCallback } from 'react';
import { SoundManager } from './SoundManager'; // Import the Sound Manager

const Link = ({ x1, y1, x2, y2, pitch }) => {
  const lineRef = useRef(null);
  const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const linkHeight = 5;

  const isInsideLink = useCallback((touchX, touchY) => {
    const dx = touchX - x1;
    const dy = touchY - y1;
    const lineDx = x2 - x1;
    const lineDy = y2 - y1;
    const lineLengthSquared = lineDx * lineDx + lineDy * lineDy;

    const t = Math.max(0, Math.min(1, (dx * lineDx + dy * lineDy) / lineLengthSquared));

    const closestX = x1 + t * lineDx;
    const closestY = y1 + t * lineDy;

    const distance = Math.sqrt((touchX - closestX) ** 2 + (touchY - closestY) ** 2);
    return distance <= linkHeight / 2;
  }, [x1, y1, x2, y2, linkHeight]);

  // Handle touch events
  const handleTouchStart = useCallback((e) => {
    const svg = lineRef.current.ownerSVGElement;
    const point = svg.createSVGPoint();

    for (let touch of e.touches) {
      point.x = touch.clientX;
      point.y = touch.clientY;
      const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse());
      const touchX = svgPoint.x;
      const touchY = svgPoint.y;

      if (isInsideLink(touchX, touchY)) {
        SoundManager.startLinkSound(pitch);
      }
    }
  }, [pitch, isInsideLink]);

  const handleTouchMove = useCallback((e) => {
    const svg = lineRef.current.ownerSVGElement;
    const point = svg.createSVGPoint();

    for (let touch of e.touches) {
      point.x = touch.clientX;
      point.y = touch.clientY;
      const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse());
      const touchX = svgPoint.x;
      const touchY = svgPoint.y;

      if (isInsideLink(touchX, touchY)) {
        SoundManager.startLinkSound(pitch);
      } else {
        SoundManager.stopLinkSound(pitch);
      }
    }
  }, [pitch, isInsideLink]);

  const handleTouchEnd = useCallback(() => {
    SoundManager.stopLinkSound(pitch);
  }, [pitch]);

  useEffect(() => {
    const handleDocumentTouchEnd = (e) => handleTouchEnd(e);
    const handleDocumentTouchMove = (e) => handleTouchMove(e);

    document.addEventListener('touchend', handleDocumentTouchEnd);
    document.addEventListener('touchmove', handleDocumentTouchMove);

    return () => {
      document.removeEventListener('touchend', handleDocumentTouchEnd);
      document.removeEventListener('touchmove', handleDocumentTouchMove);
    };
  }, [handleTouchEnd, handleTouchMove]);

  return (
    <rect
      ref={lineRef}
      x={x1}
      y={y1}
      width={length}
      height={linkHeight}
      fill="white"
      transform={`rotate(${angle * (180 / Math.PI)}, ${x1}, ${y1})`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ cursor: 'pointer', transition: 'width 0.2s ease', touchAction: 'none' }}
    />
  );
};

export default Link;