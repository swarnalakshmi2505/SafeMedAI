import { NavLink, useNavigate } from 'react-router-dom';
import {
  Bell,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Search,
  Zap,
  Users,
  Activity,
  Shield,
  BarChart3,
  BrainCircuit
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/officer/dashboard',    icon: LayoutDashboard, label: 'Command Center'    },
  { to: '/officer/leaderboard',  icon: BarChart3,       label: 'Risk Intelligence' },
  { to: '/officer/search',       icon: Search,          label: 'Molecular Search'  },
  { to: '/officer/alerts',       icon: Bell,            label: 'Signal Alerts',      badge: 3 },
  { to: '/officer/interaction',  icon: Zap,             label: 'Drug Analytics' },
  { to: '/officer/personalized', icon: Users,           label: 'Patient Profiling' },
  { to: '/officer/sentiment',    icon: Activity,        label: 'Surveillance'    },
  { to: '/officer/reports',      icon: FileText,        label: 'Clinical Reports'      },
  { to: '/officer/chatbot',      icon: BrainCircuit,    label: 'AI Analyst' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="sticky top-0 h-screen w-64 bg-brand-navy border-r border-clinical-border flex flex-col z-50">
      {/* Brand Header */}
      <div className="flex items-center gap-3 p-6 mb-2">
        <div className="relative">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-blue to-brand-cyan flex items-center justify-center shadow-glow-blue relative z-10">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="absolute -inset-1 bg-brand-cyan/20 blur-md rounded-lg animate-pulse-slow"></div>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tighter text-white">SafeMed<span className="text-brand-cyan">AI</span></h1>
          <p className="text-[8px] font-bold text-brand-cyan/60 uppercase tracking-[0.2em]">Intelligence Platform</p>
        </div>
      </div>

      {/* User Context */}
      <div className="mx-4 mb-8 p-3 bg-white/5 rounded-xl border border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-surface-700 to-surface-500 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white uppercase">
            {user?.full_name?.substring(0, 2) || 'OF'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.full_name || 'Officer'}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="status-pulse bg-brand-emerald"></span>
              <span className="text-[9px] text-surface-400 font-medium uppercase tracking-wider">System Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-hide">
        <div className="text-[10px] font-bold text-surface-500 uppercase tracking-[0.15em] px-3 mb-3">Core Intelligence</div>
        {navItems.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `
              sidebar-link relative group
              ${isActive ? 'sidebar-link-active' : ''}
            `}
          >
            <Icon className={`w-4 h-4 transition-colors duration-300 ${isActive ? 'text-brand-cyan' : 'group-hover:text-white'}`} />
            <span className="text-sm font-medium flex-1">{label}</span>
            {badge && (
              <span className="bg-brand-red text-[9px] text-white px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                {badge}
              </span>
            )}
            {/* Active Indicator Bar */}
            <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-cyan rounded-l-full transition-all duration-300 transform scale-y-0 opacity-0 group-[.sidebar-link-active]:scale-y-100 group-[.sidebar-link-active]:opacity-100`} />
          </NavLink>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-clinical-border bg-white/[0.02]">
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-surface-400 font-medium transition-all duration-300 hover:bg-brand-red/10 hover:text-brand-red"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">System Logout</span>
        </button>
      </div>
    </aside>
  );
}

