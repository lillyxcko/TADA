import React, { useRef } from 'react';
import Node from './Node';
import Link from './Link';

const Diagram = () => {
  const svgRef = useRef(null); // Create the ref for the SVG

  // Define the coordinates and properties of the nodes
  const nodes = [
    { cx: 80, cy: 250, r: 35, pitch: 261.63, value: "cat" },
    { cx: 300, cy: 210, r: 35, pitch: 329.63, value: 576.5 },
    { cx: 220, cy: 80, r: 35, pitch: 392.00, value: "dog" },
  ];

  // Define the links (hardcoded based on node positions)
  const links = [
    {
      x1: 80,  // Starting node x
      y1: 250, // Starting node y
      x2: 300, // Ending node x
      y2: 210, // Ending node y
      pitch: 500
    },
    {
      x1: 300, // Starting node x
      y1: 210, // Starting node y
      x2: 220, // Ending node x
      y2: 80,  // Ending node y
      pitch: 500
    },
    {
      x1: 220, // Starting node x
      y1: 80,  // Starting node y
      x2: 80,  // Ending node x
      y2: 250, // Ending node y
      pitch: 500
    },
  ];

  return (
    <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 400 400">
      <rect width="100%" height="100%" fill="transparent" />

      {links.map((link, index) => (
        <Link
          key={index}
          x1={link.x1}
          y1={link.y1}
          x2={link.x2}
          y2={link.y2}
          pitch={link.pitch}
          svgRef={svgRef} // Pass the SVG ref
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