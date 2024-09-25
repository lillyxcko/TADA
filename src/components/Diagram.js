import React from 'react';
import Node from './Node';
import Link from './Link';

const Diagram = () => {
  // Define the coordinates and properties of the nodes
  const nodes = [
    { cx: 80, cy: 250, r: 35, pitch: 261.63, value: "cat" },
    { cx: 300, cy: 210, r: 35, pitch: 329.63, value: 576.5 },
    { cx: 220, cy: 80, r: 35, pitch: 392.00, value: "dog" },
  ];

  // Define the links (connect nodes by their indices in the nodes array)
  const links = [
    { from: 0, to: 1, pitch: 500 }, // Link between node 0 (cat) and node 1 (576.5)
    { from: 1, to: 2, pitch: 500 }, // Link between node 1 (576.5) and node 2 (dog)
    { from: 0, to: 2, pitch: 500 }, // Link between node 0 (cat) and node 2 (dog)
  ];

  return (
    <svg width="100%" height="100%" viewBox="0 0 400 400">
      <rect width="100%" height="100%" fill="transparent" />

      {links.map((link, index) => (
        <Link
          key={index}
          x1={nodes[link.from].cx}
          y1={nodes[link.from].cy}
          x2={nodes[link.to].cx}
          y2={nodes[link.to].cy}
          pitch={link.pitch} 
        />
      ))}

      {nodes.map((node, index) => (
        <Node
          key={index}
          cx={node.cx}
          cy={node.cy}
          r={node.r}
          pitch={node.pitch}
          value={node.value}
        />
      ))}
    </svg>
  );
};

export default Diagram;