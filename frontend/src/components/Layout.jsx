import React from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children, title }) {
  return (
    <div className="min-h-screen bg-medical-50 flex font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="sticky top-0 z-30 bg-white border-b border-medical-100 px-8 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase">
              {title || 'SafeMedAI Dashboard'}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                PV Systems Normal · {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="h-8 w-[1px] bg-slate-100" />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[11px] font-extrabold text-slate-900 leading-none">Security Node</p>
                <p className="text-[9px] font-bold text-medical-500 uppercase tracking-tighter mt-1">Status: Active</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-medical-50 border border-medical-100 flex items-center justify-center text-xs">
                📡
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
