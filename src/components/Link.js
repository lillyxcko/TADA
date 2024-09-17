import React from 'react';

// A Link component that connects two points (x1, y1) and (x2, y2)
const Link = ({ x1, y1, x2, y2, thickness }) => {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="black"
      strokeWidth={8} 
    />
  );
};

export default Link;