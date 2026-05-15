import React from 'react';

export default function RiskRing({ score, size = 72 }) {
  const r = (size / 2) - 7;
  const circ = 2 * Math.PI * r;
  
  const getColor = (s) => {
    if (s >= 75) return "#ef4444"; // Red 500
    if (s >= 50) return "#f97316"; // Orange 500
    if (s >= 30) return "#eab308"; // Yellow 500
    return "#22c55e"; // Green 500
  };

  const color = getColor(score);
  const dash = (score / 100) * circ;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle 
          cx={size/2} 
          cy={size/2} 
          r={r} 
          fill="none" 
          stroke="#e8f4fd" 
          strokeWidth={7} 
        />
        <circle 
          cx={size/2} 
          cy={size/2} 
          r={r} 
          fill="none" 
          stroke={color} 
          strokeWidth={7}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          className="risk-ring"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-bold" style={{ color }}>{score}</span>
      </div>
    </div>
  );
}
