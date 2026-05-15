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
} from 'recharts';

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

  if (loading) {
    return (
      <Layout title="Analytics Hub">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-medical-100 border-t-medical-500 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-medical-600 uppercase tracking-widest animate-pulse">Aggregating Risk Matrix...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Risk Intelligence Leaderboard">
      <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-safemed-fadein">
        
        {/* Header Section */}
        <div className="flex items-center justify-between bg-white border border-medical-100 rounded-2xl p-6 shadow-soft">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">Clinical Disproportionality Ranking</h1>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">
              Live ranking of lead compounds by ROR disproportionality
            </p>
          </div>
          <button
            onClick={() => navigate('/officer/alerts')}
            className="bg-medical-500 hover:bg-medical-600 text-white px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-lg shadow-medical-500/20 active:scale-95 flex items-center gap-2"
          >
            Review Active Signals
          </button>
        </div>

        {/* Stats Strip */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon="📋" label="Data Points Analyzed" value={summary.total_reports || 0} color="#0ea5e9" trend="up" sub="Global FAERS Feed" />
          <StatCard icon="💊" label="Compounds Surveyed" value={summary.drugs_tracked || 0} color="#8b5cf6" trend="up" sub="Active Nodes" />
          <StatCard icon="🚨" label="Critical Alerts" value={criticalCount} color="#ef4444" trend="up" sub="Priority 1" />
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main List */}
          <div className="xl:col-span-2 space-y-4">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Compound Risk Matrix</h2>
            <div className="flex flex-col gap-3">
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

          {/* Side Chart */}
          <div className="space-y-4">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Relative Signal Intensity</h2>
            <div className="safemed-card sticky top-32">
              <div className="h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leaderboard.slice(0, 10)} layout="vertical" margin={{ left: 0, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="drug_name" 
                      type="category" 
                      fontSize={10} 
                      fontWeight={700}
                      width={80}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e0f2fe', 
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                        padding: '8px'
                      }} 
                    />
                    <Bar dataKey="risk_score" radius={[0, 4, 4, 0]} name="Intensity">
                      {leaderboard.slice(0, 10).map((drug) => {
                        const score = drug.risk_score || 0;
                        const fill = score >= 70 ? '#ef4444' : score >= 55 ? '#f97316' : score >= 30 ? '#eab308' : '#0ea5e9';
                        return <Cell key={drug.drug_name} fill={fill} fillOpacity={0.8} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest mt-4">Top 10 High-Signal Compounds</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
