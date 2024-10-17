import React, { useRef } from 'react';
import Node from './Node';
import Link from './Link';

const Diagram = () => {
  const svgRef = useRef(null); // Create the ref for the SVG

  // Define the coordinates and properties of the nodes
  const nodes = [
    { cx: 80, cy: 250, r: 35, pitch: 261.63, value: "cat" },
    { cx: 300, cy: 210, r: 35, pitch: 329.63, value: 576.5 },
    { cx: 220, cy: 80, r: 35, pitch: 261.63, value: "dog" },
  ];

  // Function to adjust link coordinates based on node radii
  const calculateAdjustedCoordinates = (x1, y1, x2, y2, r1, r2) => {
    // Calculate the distance between the two node centers
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calculate the unit vector (direction) of the link
    const ux = dx / distance;
    const uy = dy / distance;

    // Adjust the link endpoints so they stop at the edge of each node
    const newX1 = x1 + ux * r1;
    const newY1 = y1 + uy * r1;
    const newX2 = x2 - ux * r2;
    const newY2 = y2 - uy * r2;

    return { newX1, newY1, newX2, newY2 };
  };

  // Define the links (hardcoded based on node positions)
  const links = [
    {
      x1: nodes[0].cx,
      y1: nodes[0].cy,
      x2: nodes[1].cx,
      y2: nodes[1].cy,
      r1: nodes[0].r,
      r2: nodes[1].r,
      pitch: 500,
    },
    {
      x1: nodes[1].cx,
      y1: nodes[1].cy,
      x2: nodes[2].cx,
      y2: nodes[2].cy,
      r1: nodes[1].r,
      r2: nodes[2].r,
      pitch: 500,
    },
    {
      x1: nodes[2].cx,
      y1: nodes[2].cy,
      x2: nodes[0].cx,
      y2: nodes[0].cy,
      r1: nodes[2].r,
      r2: nodes[0].r,
      pitch: 500,
    },
  ];

  return (
    <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 400 400">
      <rect width="100%" height="100%" fill="transparent" />

      {links.map((link, index) => {
        const { newX1, newY1, newX2, newY2 } = calculateAdjustedCoordinates(
          link.x1,
          link.y1,
          link.x2,
          link.y2,
          link.r1,
          link.r2
        );

        return (
          <Link
            key={index}
            x1={newX1}
            y1={newY1}
            x2={newX2}
            y2={newY2}
            pitch={link.pitch}
            svgRef={svgRef} // Pass the SVG ref
          />
        );
      })}

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