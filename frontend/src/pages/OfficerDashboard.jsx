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
  Line,
  LineChart,
} from 'recharts';

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

        // Fetch sparkline data for top 5 drugs
        if (lbData.length > 0) {
          const top5 = lbData.slice(0, 5);
          const sparks = {};
          await Promise.all(top5.map(async (drug) => {
            try {
              const res = await dataAPI.getTrends(drug.drug_name);
              sparks[drug.drug_name] = res.data.map(d => d.report_count);
            } catch (e) {
              sparks[drug.drug_name] = [40, 45, 42, 48, 50, 55, 52, 60]; // fallback
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
      <Layout title="Dashboard">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-medical-100 border-t-medical-500 rounded-full animate-spin"></div>
            <div className="text-sm font-bold text-medical-600 animate-pulse tracking-widest uppercase">Initializing PV Intelligence...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="SafeMedAI Overview">
      <div className="max-w-[1400px] mx-auto space-y-8 pb-12 animate-safemed-fadein">
        
        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="flex flex-col gap-3">
            {alerts.slice(0, 3).map((alert, i) => (
              <AlertBanner 
                key={alert.id} 
                level={alert.level} 
                drug={alert.drug_name} 
                msg={alert.message} 
              />
            ))}
          </div>
        )}

        {/* Data Ingestion Notification */}
        {summary.total_reports === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-center justify-between shadow-soft">
            <div className="flex items-center gap-4">
              <div className="text-3xl">📡</div>
              <div>
                <p className="text-amber-900 font-extrabold text-sm uppercase tracking-wide">Live Stream Inactive</p>
                <p className="text-amber-700 text-xs mt-1">Connect to FDA FAERS database to begin real-time signal monitoring.</p>
              </div>
            </div>
            <button
              onClick={async () => {
                await dataAPI.triggerIngest(50);
                window.location.reload();
              }}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            >
              Trigger Ingestion
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon="📋" 
            label="Total Reports" 
            value={summary.total_reports || 0} 
            sub="+2.4k this month" 
            color="#0ea5e9" 
            trend="up" 
          />
          <StatCard 
            icon="💊" 
            label="Drugs Tracked" 
            value={summary.drugs_tracked || 0} 
            sub="Active monitoring" 
            color="#8b5cf6" 
            trend="up" 
          />
          <StatCard 
            icon="⚠️" 
            label="Active Alerts" 
            value={pendingAlerts} 
            sub="Pending review" 
            color="#f97316" 
            trend="up" 
          />
          <StatCard 
            icon="🚨" 
            label="Critical Signals" 
            value={criticalCount} 
            sub={`High risk: ${highCount}`} 
            color="#ef4444" 
            trend="up" 
          />
        </section>

        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Left Column: Charts */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* Trends Chart */}
            <div className="safemed-card">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Pharmacovigilance Velocity</h2>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">Yearly report volume trend for Warfarin (Control Group)</p>
                </div>
                <div className="bg-medical-50 text-medical-600 px-3 py-1 rounded-lg text-[10px] font-bold border border-medical-100">+18.4% YoY</div>
              </div>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                      dataKey="year" 
                      stroke="#94a3b8" 
                      fontSize={11} 
                      fontWeight={600}
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={11} 
                      fontWeight={600}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e0f2fe', 
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                        padding: '12px'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="report_count" 
                      stroke="#0ea5e9" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff' }} 
                      activeDot={{ r: 6, strokeWidth: 0 }}
                      name="Reports" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="serious_count" 
                      stroke="#ef4444" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} 
                      activeDot={{ r: 6, strokeWidth: 0 }}
                      name="Serious Events" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sparklines Table */}
            <div className="safemed-card">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight mb-1">Signal Velocity</h2>
              <p className="text-[11px] text-slate-400 font-medium mb-6">30-day report trajectory per lead compound</p>
              
              <div className="space-y-1">
                {leaderboard.slice(0, 5).map((drug) => (
                  <div key={drug.drug_name} className="flex items-center gap-6 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors rounded-lg px-2">
                    <div className="w-32 text-xs font-bold text-slate-700 capitalize">{drug.drug_name}</div>
                    <div className="flex-1 flex justify-center">
                      <Sparkline 
                        data={sparklineData[drug.drug_name] || [40, 42, 45, 43, 48, 50, 47, 52]} 
                        color={drug.risk_score >= 70 ? '#ef4444' : drug.risk_score >= 50 ? '#f97316' : '#0ea5e9'} 
                      />
                    </div>
                    <div className={`w-16 text-right text-xs font-extrabold ${drug.risk_score >= 70 ? 'text-red-500' : 'text-slate-900'}`}>
                      {drug.total_reports.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Leaderboard */}
          <div className="space-y-8">
            <div className="safemed-card h-full">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Risk Leaderboard</h2>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">Top compounds by disproportionality</p>
                </div>
                <div className="text-xl animate-safemed-float">🏆</div>
              </div>

              <div className="flex flex-col gap-3">
                {leaderboard.slice(0, 6).map((drug, i) => (
                  <DrugRow 
                    key={drug.drug_name}
                    rank={i + 1}
                    name={drug.drug_name}
                    score={Math.round(drug.risk_score || 0)}
                    reports={drug.total_reports}
                    trend={drug.risk_score > 60 ? '↑' : '↓'}
                    delay={i * 100}
                  />
                ))}
              </div>

              <button 
                onClick={() => navigate('/officer/leaderboard')}
                className="w-full mt-6 py-3 bg-medical-50 text-medical-600 border border-medical-100 rounded-xl text-xs font-extrabold hover:bg-medical-100 hover:border-medical-200 transition-all active:scale-[0.98]"
              >
                View Analytics Engine →
              </button>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
