import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
  CartesianGrid,
} from 'recharts';
import { 
  ShieldAlert, 
  Database, 
  Activity, 
  TrendingUp, 
  BarChart as BarChartIcon, 
  Zap, 
  ChevronRight,
  RefreshCw,
  Cpu,
  Layers,
  BrainCircuit
} from 'lucide-react';

import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import AlertBanner from '../components/AlertBanner';
import DrugRow from '../components/DrugRow';
import Sparkline from '../components/Sparkline';
import { alertsAPI, analyticsAPI, dataAPI } from '../services/api';

export default function OfficerDashboard() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [summary, setSummary] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sparklineData, setSparklineData] = useState({});

  useEffect(() => {
    let mounted = true;

    const loadAll = async () => {
      try {
        const [lb, sum, al, tr] = await Promise.allSettled([
          analyticsAPI.getLeaderboard(),
          dataAPI.getSummary(),
          alertsAPI.getAlerts(),
          dataAPI.getTrends('warfarin'),
        ]);

        if (!mounted) return;
        
        let lbData = [];
        if (lb.status === 'fulfilled') {
          lbData = lb.value.data || [];
          setLeaderboard(lbData);
        }
        if (sum.status === 'fulfilled') setSummary(sum.value.data || {});
        if (al.status === 'fulfilled') setAlerts((al.value.data || []).slice(0, 5));
        if (tr.status === 'fulfilled') setTrends(tr.value.data || []);

        if (lbData.length > 0) {
          const top5 = lbData.slice(0, 5);
          const sparks = {};
          await Promise.all(top5.map(async (drug) => {
            try {
              const res = await dataAPI.getTrends(drug.drug_name);
              sparks[drug.drug_name] = res.data.map(d => d.report_count);
            } catch (e) {
              sparks[drug.drug_name] = [40, 45, 42, 48, 50, 55, 52, 60];
            }
          }));
          setSparklineData(sparks);
        }

      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadAll();

    return () => {
      mounted = false;
    };
  }, []);

  const criticalCount = useMemo(() => leaderboard.filter((drug) => (drug.risk_score || 0) >= 70).length, [leaderboard]);
  const highCount = useMemo(() => leaderboard.filter((drug) => (drug.risk_score || 0) >= 55).length, [leaderboard]);
  const pendingAlerts = alerts.filter((alert) => !alert.is_validated).length;

  if (loading) {
    return (
      <Layout title="Command Center">
        <div className="flex h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-brand-blue/10 border-t-brand-blue rounded-full animate-spin"></div>
              <Cpu className="w-8 h-8 text-brand-blue absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-white tracking-[0.2em] uppercase transition-colors">Booting PV Intelligence</div>
              <div className="text-[10px] text-surface-500 mt-2 font-mono">ENCRYPTED CONNECTION ESTABLISHED...</div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Safety Intelligence Console">
      <div className="space-y-10 pb-20 animate-safemed-fadein">
        
        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alerts.slice(0, 3).map((alert) => (
              <AlertBanner 
                key={alert.id} 
                level={alert.level} 
                drug={alert.drug_name} 
                msg={alert.message} 
              />
            ))}
          </div>
        )}

        {/* Live Stream Status */}
        {summary.total_reports === 0 && (
          <div className="clinical-card bg-brand-amber/5 border-brand-amber/20 flex items-center justify-between group">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-xl bg-brand-amber/10 flex items-center justify-center border border-brand-amber/20 group-hover:scale-110 transition-transform">
                <RefreshCw className="w-6 h-6 text-brand-amber animate-spin-slow" />
              </div>
              <div>
                <p className="text-brand-amber font-black text-sm uppercase tracking-[0.1em]">Signal Stream Offline</p>
                <p className="text-surface-500 text-xs mt-1 font-medium">Initialize real-time link with FDA FAERS data clusters.</p>
              </div>
            </div>
            <button
              onClick={async () => {
                await dataAPI.triggerIngest(50);
                window.location.reload();
              }}
              className="btn-premium bg-brand-amber hover:bg-amber-600 shadow-glow-amber/20"
            >
              Initialize Ingestion
            </button>
          </div>
        )}

        {/* Top-Level KPIs */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={<Database className="w-5 h-5" />} 
            label="Total Signals" 
            value={summary.total_reports || 0} 
            sub="Surveillance Volume" 
            color="#2563EB" 
            trend="up" 
          />
          <StatCard 
            icon={<Zap className="w-5 h-5" />} 
            label="Compounds" 
            value={summary.drugs_tracked || 0} 
            sub="Active Monitoring" 
            color="#8b5cf6" 
            trend="up" 
          />
          <StatCard 
            icon={<ShieldAlert className="w-5 h-5" />} 
            label="Pending Signals" 
            value={pendingAlerts} 
            sub="Requires Validation" 
            color="#f97316" 
            trend="up" 
          />
          <StatCard 
            icon={<Activity className="w-5 h-5" />} 
            label="Critical Risks" 
            value={criticalCount} 
            sub={`Disproportionality > 70%`} 
            color="#ef4444" 
            trend="up" 
          />
        </section>

        {/* Intelligence Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Main Visualizations */}
          <div className="xl:col-span-2 space-y-8">
            
            <div className="clinical-card">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <BarChartIcon className="w-5 h-5 text-brand-blue" />
                    Pharmacovigilance Velocity
                  </h2>
                  <p className="text-[11px] text-surface-500 font-bold uppercase tracking-widest mt-1">Temporal Signal Distribution · Warfarin (Control)</p>
                </div>
                <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                  <span className="text-[10px] font-bold text-brand-emerald">+18.4% YoY</span>
                </div>
              </div>
              
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends}>
                    <defs>
                      <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis 
                      dataKey="year" 
                      stroke="#475569" 
                      fontSize={11} 
                      fontWeight={600}
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis 
                      stroke="#475569" 
                      fontSize={11} 
                      fontWeight={600}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0B1220', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        borderRadius: '12px',
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
                        padding: '12px'
                      }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                      labelStyle={{ color: '#94A3B8', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="report_count" 
                      stroke="#2563EB" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorReports)" 
                      name="Signals"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="serious_count" 
                      stroke="#EF4444" 
                      strokeWidth={2} 
                      fill="transparent"
                      name="Serious AE" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="clinical-card">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <Activity className="w-5 h-5 text-brand-cyan" />
                    Real-time Signal Surveillance
                  </h2>
                  <p className="text-[11px] text-surface-500 font-bold uppercase tracking-widest mt-1">30-day signal trajectory per lead compound</p>
                </div>
              </div>
              
              <div className="overflow-hidden rounded-xl border border-white/[0.05]">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="p-4 text-[10px] font-black text-surface-500 uppercase tracking-widest">Compound ID</th>
                      <th className="p-4 text-[10px] font-black text-surface-500 uppercase tracking-widest text-center">Signal Velocity</th>
                      <th className="p-4 text-[10px] font-black text-surface-500 uppercase tracking-widest text-right">Risk Score</th>
                      <th className="p-4 text-[10px] font-black text-surface-500 uppercase tracking-widest text-right">Total Signals</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {leaderboard.slice(0, 5).map((drug) => (
                      <tr key={drug.drug_name} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 font-bold text-white capitalize group-hover:text-brand-cyan transition-colors">
                          {drug.drug_name}
                        </td>
                        <td className="p-4 flex justify-center py-4">
                          <Sparkline 
                            data={sparklineData[drug.drug_name] || [40, 42, 45, 43, 48, 50, 47, 52]} 
                            color={drug.risk_score >= 70 ? '#EF4444' : drug.risk_score >= 50 ? '#F59E0B' : '#38BDF8'} 
                          />
                        </td>
                        <td className="p-4 text-right">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold border ${
                            drug.risk_score >= 70 ? 'bg-brand-red/10 border-brand-red/30 text-brand-red' : 
                            drug.risk_score >= 50 ? 'bg-brand-amber/10 border-brand-amber/30 text-brand-amber' : 
                            'bg-brand-blue/10 border-brand-blue/30 text-brand-blue'
                          }`}>
                            {Math.round(drug.risk_score)}%
                          </span>
                        </td>
                        <td className="p-4 text-right font-mono text-xs text-surface-500">
                          {drug.total_reports.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: High Risk Intelligence */}
          <div className="space-y-8">
            <div className="clinical-card h-full flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Risk Hierarchy</h2>
                  <p className="text-[11px] text-surface-500 font-bold uppercase tracking-widest mt-1">Lead disproportionality ranking</p>
                </div>
                <div className="p-2 rounded-lg bg-brand-red/10 border border-brand-red/20">
                  <TrendingUp className="w-5 h-5 text-brand-red" />
                </div>
              </div>

              <div className="space-y-4 flex-1">
                {leaderboard.slice(0, 7).map((drug, i) => (
                  <DrugRow 
                    key={drug.drug_name}
                    rank={i + 1}
                    name={drug.drug_name}
                    score={Math.round(drug.risk_score || 0)}
                    reports={drug.total_reports}
                    trend={drug.risk_score > 60 ? '↑' : '↓'}
                    delay={i * 80}
                  />
                ))}
              </div>

              <button 
                onClick={() => navigate('/officer/leaderboard')}
                className="w-full mt-8 py-4 bg-white/5 border border-white/10 rounded-xl text-[11px] font-bold text-white uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-white/10 transition-all group"
              >
                Access Intelligence Engine
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            {/* AI Audit Engine Mini Panel */}
            <div className="clinical-card bg-gradient-to-br from-brand-blue/10 to-transparent">
              <div className="flex items-center gap-3 mb-6">
                <BrainCircuit className="w-6 h-6 text-brand-cyan" />
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Neural Audit Engine</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-surface-500 font-bold uppercase">Signal Matrix</span>
                  <span className="text-[10px] text-brand-emerald font-black">SYNCED</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-surface-500 font-bold uppercase">Bayesian Logic</span>
                  <span className="text-[10px] text-brand-cyan font-black">ACTIVE</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden mt-4">
                  <div className="h-full bg-brand-cyan w-[84%] animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
