const Node = ({ id, cx, cy, r, pitch, value }) => {
  const activeTouches = useRef(new Set());
  const circleRef = useRef(null);
  const [radius, setRadius] = useState(r);

  const isInsideCircle = useCallback((touchX, touchY) => {
    const circle = circleRef.current.getBoundingClientRect();
    const centerX = circle.left + circle.width / 2;
    const centerY = circle.top + circle.height / 2;
    const distanceSquared = (touchX - centerX) ** 2 + (touchY - centerY) ** 2;

    const effectiveRadius = r + 60;
    return distanceSquared < effectiveRadius ** 2;
  }, [r]);

  const handleTouchStart = useCallback((e) => {
    for (let i = 0; i < e.touches.length; i++) {
      const touchX = e.touches[i].clientX;
      const touchY = e.touches[i].clientY;

      if (isInsideCircle(touchX, touchY)) {
        activeTouches.current.add(e.touches[i].identifier);
        SoundManager.startNodeSound(id, pitch); // Use unique node ID
        setRadius(r + 10);
      }
    }
  }, [id, pitch, r, isInsideCircle]);

  const handleTouchMove = useCallback((e) => {
    for (let i = 0; i < e.touches.length; i++) {
      const touchX = e.touches[i].clientX;
      const touchY = e.touches[i].clientY;
      const isInside = isInsideCircle(touchX, touchY);

      if (isInside && !activeTouches.current.has(e.touches[i].identifier)) {
        activeTouches.current.add(e.touches[i].identifier);
        SoundManager.startNodeSound(id, pitch);
        setRadius(r + 10);
      } else if (!isInside && activeTouches.current.has(e.touches[i].identifier)) {
        activeTouches.current.delete(e.touches[i].identifier);
        SoundManager.stopNodeSound(id); // Use node ID to stop sound
        setRadius(r);
      }
    }
  }, [id, pitch, r, isInsideCircle]);

  const handleTouchEnd = useCallback((e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const identifier = e.changedTouches[i].identifier;
      if (activeTouches.current.has(identifier)) {
        activeTouches.current.delete(identifier);
        if (activeTouches.current.size === 0) {
          SoundManager.stopNodeSound(id);
          setRadius(r);
        }
      }
    }
  }, [id, r]);

  return (
    <circle
      ref={circleRef}
      cx={cx}
      cy={cy}
      r={radius}
      fill="lightblue"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      style={{ cursor: 'pointer', transition: 'r 0.2s ease' }}
    />
  );
};

export default Node;