import React, { useState, useEffect } from 'react';
import RiskRing from './RiskRing';

export default function DrugRow({ rank, name, score, reports, trend, delay }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`
      flex items-center gap-4 p-3 px-4 rounded-xl cursor-pointer
      transition-all duration-200
      ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
      bg-slate-50 border border-slate-100 hover:bg-medical-50 hover:border-medical-200 hover:shadow-soft group
    `}>
      <div className={`
        w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold
        ${rank === 1 ? 'bg-amber-100 text-amber-700 border border-amber-200' : 
          rank === 2 ? 'bg-slate-200 text-slate-700 border border-slate-300' :
          'bg-white text-slate-400 border border-slate-200'}
      `}>
        {rank}
      </div>

      <div className="flex-1">
        <div className="text-sm font-bold text-slate-900 capitalize group-hover:text-medical-600 transition-colors">
          {name}
        </div>
        <div className="text-[11px] text-slate-500 font-medium">
          {reports.toLocaleString()} reports
        </div>
      </div>

      <RiskRing score={score} size={56} />

      <div className={`
        text-[11px] font-bold w-5 text-center
        ${trend === '↑' ? 'text-red-500' : 'text-green-500'}
      `}>
        {trend}
      </div>
    </div>
  );
}
