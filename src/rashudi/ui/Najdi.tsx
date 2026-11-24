import React from "react";
/* The Najdi triangular crenellation — the page's signature motif.
   <Crenel/> draws a repeating row of triangles at a section's edge. */
export function Crenel({ color = "currentColor", flip = false, className = "", size = 22 }:
  { color?: string; flip?: boolean; className?: string; size?: number }) {
  const id = React.useId().replace(/:/g, "");
  return (
    <svg className={"mx-crenel " + className} style={{ height: size, transform: flip ? "scaleY(-1)" : undefined }}
      width="100%" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <pattern id={"cr" + id} width={size * 1.6} height={size} patternUnits="userSpaceOnUse">
          <path d={`M0 ${size} L${size * 0.8} 0 L${size * 1.6} ${size} Z`} fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height={size} fill={`url(#cr${id})`} />
    </svg>
  );
}
/* A small row of triangle vents used as a divider / bullet */
export function Vents({ n = 3, className = "" }: { n?: number; className?: string }) {
  return (
    <span className={"mx-vents " + className} aria-hidden="true">
      {Array.from({ length: n }).map((_, i) => <i key={i} />)}
    </span>
  );
}
