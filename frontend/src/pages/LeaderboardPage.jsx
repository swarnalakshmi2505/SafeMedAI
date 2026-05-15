import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { ShieldAlert, BarChart as BarChartIcon, TrendingUp, Activity, ChevronRight, Cpu, Filter, ArrowDownWideZap, Database, AlertCircle, Shield } from 'lucide-react';

import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import DrugRow from '../components/DrugRow';
import { analyticsAPI, dataAPI } from '../services/api';

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([analyticsAPI.getLeaderboard(), dataAPI.getSummary()])
      .then(([leaderboardResponse, summaryResponse]) => {
        if (!mounted) return;
        setLeaderboard(leaderboardResponse.data || []);
        setSummary(summaryResponse.data || {});
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const criticalCount = useMemo(() => leaderboard.filter((drug) => (drug.risk_score || 0) >= 70).length, [leaderboard]);
  
  const radarData = useMemo(() => {
    return leaderboard.slice(0, 5).map(drug => ({
      subject: drug.drug_name.charAt(0).toUpperCase() + drug.drug_name.slice(1, 8),
      A: drug.risk_score,
      fullMark: 100,
    }));
  }, [leaderboard]);

  if (loading) {
    return (
      <Layout title="Risk Hub">
        <div className="flex h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 border-2 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin"></div>
              <BarChartIcon className="absolute inset-0 m-auto w-6 h-6 text-brand-blue animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-xs font-black text-brand-blue uppercase tracking-[0.3em] animate-pulse">Synchronizing Risk Matrix</p>
              <p className="text-[10px] text-surface-500 mt-2 font-medium">Aggregating Global Signal Data...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Risk Intelligence Hub">
      <div className="max-w-[1600px] mx-auto space-y-8 pb-12 animate-safemed-fadein">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-brand-red/10 border border-brand-red/20 rounded-2xl flex items-center justify-center shadow-glow-red/10">
              <ShieldAlert className="w-7 h-7 text-brand-red animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Clinical Risk <span className="text-brand-red">Intelligence</span></h1>
              <p className="text-[11px] text-surface-500 font-bold uppercase tracking-[0.2em] mt-2">
                Real-time prioritization of lead compounds by disproportionality metrics
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="glass-button flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span>Filter Matrix</span>
            </button>
            <button
              onClick={() => navigate('/officer/alerts')}
              className="px-6 py-3 rounded-xl bg-brand-blue text-white font-bold text-xs uppercase tracking-widest shadow-glow-blue hover:scale-105 transition-all"
            >
              Audit Active Signals
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={<Database className="w-5 h-5" />} label="Data Clusters Analyzed" value={summary.total_reports || 0} color="#38BDF8" trend="up" sub="Global FAERS Repository" />
          <StatCard icon={<Shield className="w-5 h-5" />} label="Compounds Surveilled" value={summary.drugs_tracked || 0} color="#8b5cf6" trend="up" sub="Clinical Database Nodes" />
          <StatCard icon={<AlertCircle className="w-5 h-5" />} label="Critical Disproportionality" value={criticalCount} color="#ef4444" trend="up" sub="Priority Surveillance" />
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Main List */}
          <div className="xl:col-span-8 space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-[10px] font-black text-surface-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <ArrowDownWideZap className="w-4 h-4 text-brand-blue" />
                Intelligence Ranking Matrix
              </h2>
              <span className="text-[9px] font-bold text-surface-600 uppercase tracking-widest">Sort: Risk Priority</span>
            </div>
            <div className="space-y-3">
              {leaderboard.map((drug, i) => (
                <DrugRow 
                  key={drug.drug_name}
                  rank={drug.rank}
                  name={drug.drug_name}
                  score={Math.round(drug.risk_score || 0)}
                  reports={drug.total_reports}
                  trend={drug.risk_score > 60 ? '↑' : '↓'}
                  delay={i * 50}
                />
              ))}
            </div>
          </div>

          {/* Side Visualizations */}
          <div className="xl:col-span-4 space-y-8">
            <div className="clinical-card">
               <div className="flex items-center gap-2 mb-8">
                  <Activity className="w-4 h-4 text-brand-cyan" />
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Signal Radar</h3>
               </div>
               <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.05)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 'bold' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar
                        name="Risk"
                        dataKey="A"
                        stroke="#2563EB"
                        fill="#2563EB"
                        fillOpacity={0.4}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="clinical-card">
              <div className="flex items-center gap-2 mb-8">
                  <BarChartIcon className="w-4 h-4 text-brand-blue" />
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Relative Intensity</h3>
              </div>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leaderboard.slice(0, 10)} layout="vertical" margin={{ left: 0, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="drug_name" 
                      type="category" 
                      fontSize={9} 
                      fontWeight={700}
                      width={70}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#475569' }}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                      contentStyle={{ 
                        backgroundColor: '#0B1220', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        borderRadius: '12px',
                        padding: '12px'
                      }} 
                    />
                    <Bar dataKey="risk_score" radius={[0, 4, 4, 0]} barSize={12}>
                      {leaderboard.slice(0, 10).map((drug) => {
                        const score = drug.risk_score || 0;
                        const fill = score >= 75 ? '#EF4444' : score >= 55 ? '#F59E0B' : '#38BDF8';
                        return <Cell key={drug.drug_name} fill={fill} fillOpacity={0.6} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
