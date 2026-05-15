import React from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children, title }) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-brand-navy flex font-sans selection:bg-brand-cyan/30 selection:text-white">
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-screen min-w-0 relative">
        {/* Top Intelligence Header */}
        <header className="sticky top-0 z-30 bg-brand-navy/80 backdrop-blur-xl border-b border-clinical-border px-8 py-5 flex justify-between items-center">
          <div className="animate-in fade-in slide-in-from-left-4 duration-700">
            <h2 className="text-sm font-black text-white tracking-[0.2em] uppercase">
              {title || 'Intelligence Console'}
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="status-pulse bg-brand-emerald" />
              <span className="text-[10px] font-bold text-surface-500 uppercase tracking-widest">
                Nodes Active · {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-6 animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="hidden md:flex flex-col items-end">
              <p className="text-[10px] font-black text-white leading-none uppercase tracking-widest">Security Clearance: {user?.role === 'doctor' ? 'Clinical' : 'Level 4'}</p>
              <p className="text-[9px] font-bold text-brand-cyan uppercase tracking-tighter mt-1">Terminal: {user?.full_name?.split(' ').pop().toUpperCase()}-NODE</p>
            </div>
            <div className="h-8 w-[1px] bg-white/10 hidden md:block" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg shadow-inner group hover:border-brand-cyan/40 transition-colors">
                <span className="group-hover:animate-pulse">📡</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar relative z-10">
          {children}
        </div>

        {/* Background Decor */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-brand-blue/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-brand-cyan/5 blur-[100px] rounded-full"></div>
        </div>
      </main>
    </div>
  );
}
