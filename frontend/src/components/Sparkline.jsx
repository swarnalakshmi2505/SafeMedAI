import React from 'react';

export default function Sparkline({ data, color }) {
  const w = 120, h = 36, pad = 4;
  const min = Math.min(...data), max = Math.max(...data);
  
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2);
    return `${x},${y}`;
  }).join(" ");

  const lastPt = pts.split(" ").pop().split(",");

  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline 
        points={pts} 
        fill="none" 
        stroke={color} 
        strokeWidth={2} 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <circle 
        cx={lastPt[0]} 
        cy={lastPt[1]}
        r={3} 
        fill={color} 
        className="animate-pulse"
      />
    </svg>
  );
}
