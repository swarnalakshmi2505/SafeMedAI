import React, { useState } from 'react';

export default function AlertBanner({ level, drug, msg }) {
  const [visible, setVisible] = useState(true);
  
  const configs = {
    critical: { bg: "bg-red-50", border: "border-red-200", hover: "hover:border-red-500", text: "text-red-800", badge: "bg-red-500", icon: "🔴 shadow-[0_0_8px_rgba(239,68,68,0.4)]" },
    high:     { bg: "bg-orange-50", border: "border-orange-200", hover: "hover:border-orange-500", text: "text-orange-800", badge: "bg-orange-500", icon: "🟠" },
    medium:   { bg: "bg-yellow-50", border: "border-yellow-200", hover: "hover:border-yellow-500", text: "text-yellow-800", badge: "bg-yellow-500", icon: "🟡" },
  };

  const cfg = configs[level] || configs.medium;

  if (!visible) return null;

  return (
    <div className={`
      ${cfg.bg} border-l-4 ${cfg.border} ${cfg.hover}
      rounded-r-xl p-3 px-4 flex items-center gap-3
      transition-all duration-200 hover:translate-x-1 hover:shadow-soft
      animate-safemed-slidein
    `}>
      <span className="text-lg">{cfg.icon.split(' ')[0]}</span>
      
      <div className="flex-1">
        <span className={`font-bold ${cfg.text} text-sm capitalize`}>{drug}</span>
        <span className={`text-xs ${cfg.text} opacity-80 ml-2`}>{msg}</span>
      </div>
      
      <span className={`
        ${cfg.badge} text-white text-[10px] font-bold
        px-2.5 py-0.5 rounded-full uppercase tracking-wider
      `}>
        {level}
      </span>
      
      <button 
        onClick={() => setVisible(false)}
        className={`${cfg.text} opacity-50 hover:opacity-100 transition-opacity text-xl leading-none p-1`}
      >
        ×
      </button>
    </div>
  );
}
