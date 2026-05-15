import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FilePlus, 
  Search, 
  MessageSquare, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  FileText,
  Activity,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { doctorAPI, alertsAPI, dataAPI } from '../../services/api';
import Layout from '../../components/Layout';
import KpiCard from '../../components/KpiCard';
import toast from 'react-hot-toast';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    mySubmissions: 0,
    pendingReview: 0,
    activeAlerts: 0,
    drugsMonitored: 0
  });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [reportsRes, alertsRes, summaryRes, leaderboardRes] = await Promise.all([
          doctorAPI.getMyReports(),
          alertsAPI.getAlerts(),
          dataAPI.getSummary(),
          dataAPI.getLeaderboard()
        ]);

        const reports = reportsRes.data || [];
        const allAlerts = alertsRes.data || [];
        const sentAlerts = allAlerts.filter(a => a.is_sent).slice(0, 5);
        
        setStats({
          mySubmissions: reports.length,
          pendingReview: reports.filter(r => r.status === 'pending').length,
          activeAlerts: allAlerts.filter(a => a.is_sent).length,
          drugsMonitored: summaryRes.data?.drugs_tracked || 0
        });

        setRecentAlerts(sentAlerts);
        setRecentSubmissions(reports.slice(0, 5));
        setLeaderboard(leaderboardRes.data || []);
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'life-threatening': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'severe': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'moderate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'mild': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'reviewed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'actioned': return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Initializing Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout title="Doctor Dashboard">
      <div className="space-y-8 animate-safemed-fadein">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-white">Welcome, Dr. {user?.full_name?.split(' ').pop()}</h1>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30 text-[10px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3" /> Verified
              </span>
            </div>
            <p className="text-slate-400">Your clinical intelligence portal for drug safety monitoring.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/doctor/submit')}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-teal-900/20 font-medium text-sm group"
            >
              <FilePlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
              New Report
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard 
            title="My Submissions" 
            value={stats.mySubmissions} 
            icon={<FileText className="w-6 h-6" />} 
            trend="+2 this week"
            color="teal"
          />
          <KpiCard 
            title="Pending Review" 
            value={stats.pendingReview} 
            icon={<Clock className="w-6 h-6" />} 
            color="amber"
          />
          <KpiCard 
            title="Active Drug Alerts" 
            value={stats.activeAlerts} 
            icon={<AlertTriangle className="w-6 h-6" />} 
            color="red"
          />
          <KpiCard 
            title="Drugs Monitored" 
            value={stats.drugsMonitored} 
            icon={<TrendingUp className="w-6 h-6" />} 
            color="emerald"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Alerts Section */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Recent Alerts from Officers
              </h3>
              <button className="text-xs text-teal-400 hover:text-teal-300 font-medium">View All</button>
            </div>
            <div className="divide-y divide-slate-800/50">
              {recentAlerts.length > 0 ? (
                recentAlerts.map((alert) => (
                  <div key={alert.id} className="p-4 hover:bg-white/[0.02] transition-colors group">
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-bold text-teal-400 text-sm uppercase tracking-wide">{alert.drug_name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                        alert.level === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        alert.level === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                        'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      }`}>
                        {alert.level}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 line-clamp-2 mb-2">{alert.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-medium">{new Date(alert.created_at).toLocaleDateString()}</span>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-teal-400 transition-colors" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6 text-slate-600" />
                  </div>
                  <p className="text-slate-500 text-sm">No active alerts at this time.</p>
                </div>
              )}
            </div>
          </div>

          {/* My Recent Submissions Section */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-500" />
                My Recent Submissions
              </h3>
              <button 
                onClick={() => navigate('/doctor/my-reports')}
                className="text-xs text-teal-400 hover:text-teal-300 font-medium"
              >
                Manage Reports
              </button>
            </div>
            <div className="divide-y divide-slate-800/50">
              {recentSubmissions.length > 0 ? (
                recentSubmissions.map((report) => (
                  <div key={report.id} className="p-4 hover:bg-white/[0.02] transition-colors group">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="font-mono text-[11px] text-teal-400 font-bold mb-1 block tracking-tighter">{report.report_id}</span>
                        <span className="font-bold text-white text-sm">{report.drug_name}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 mb-3 italic">"{report.symptoms?.substring(0, 60)}..."</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${getSeverityColor(report.severity)}`}>
                          {report.severity}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">{new Date(report.created_at).toLocaleDateString()}</span>
                      </div>
                      <button 
                        onClick={() => navigate('/doctor/my-reports')}
                        className="text-xs text-teal-400/60 hover:text-teal-400 font-bold transition-colors"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3">
                    <FilePlus className="w-6 h-6 text-slate-600" />
                  </div>
                  <p className="text-slate-500 text-sm mb-4">You haven't submitted any reports yet.</p>
                  <button 
                    onClick={() => navigate('/doctor/submit')}
                    className="text-xs bg-teal-500/10 text-teal-400 border border-teal-500/20 px-4 py-2 rounded-lg hover:bg-teal-500/20 transition-all"
                  >
                    Submit Your First Report
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Risk Intelligence Leaderboard */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
          <div className="p-6 border-b border-slate-800">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-500" />
              Risk Intelligence Leaderboard
            </h3>
            <p className="text-xs text-slate-500 mt-1">High-risk drugs and clinical alternatives suggested by SafeMed AI.</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Chart Section */}
              <div className="lg:col-span-1 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leaderboard.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis 
                      dataKey="drug_name" 
                      stroke="#64748b" 
                      fontSize={10} 
                      tickFormatter={(val) => val && val.length > 8 ? val.substring(0, 8) + '...' : val}
                    />
                    <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#2dd4bf' }}
                    />
                    <Bar dataKey="risk_score" radius={[4, 4, 0, 0]}>
                      {leaderboard.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.risk_score >= 70 ? '#f43f5e' : entry.risk_score >= 55 ? '#fb923c' : '#2dd4bf'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Data Section */}
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {leaderboard.length > 0 ? (
                    leaderboard.slice(0, 4).map((drug) => (
                      <div key={drug.drug_name} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-white capitalize">{drug.drug_name}</h4>
                            <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border mt-1 inline-block ${
                              drug.risk_score >= 70 ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                              drug.risk_score >= 55 ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
                              'bg-teal-500/10 text-teal-400 border-teal-500/20'
                            }`}>
                              Risk Score: {drug.risk_score}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] text-slate-500 uppercase font-bold">Alternatives</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {drug.alternatives?.length > 0 ? (
                            drug.alternatives.map((alt) => (
                              <div key={alt.drug_name} className="flex-1 bg-teal-500/5 border border-teal-500/10 rounded-lg p-2 group hover:border-teal-500/30 transition-all cursor-pointer"
                                   onClick={() => navigate('/doctor/drugs')}>
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-[10px] font-bold text-teal-400 capitalize truncate">{alt.drug_name}</span>
                                  <ArrowRight className="w-2 h-2 text-teal-500 group-hover:translate-x-0.5 transition-transform" />
                                </div>
                                <span className="text-[8px] text-slate-500 font-medium">Risk: {alt.risk_score}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-[10px] text-slate-600 italic">No alternatives indexed.</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="md:col-span-2 flex flex-col items-center justify-center py-12 text-center">
                       <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3">
                          <Activity className="w-6 h-6 text-slate-600" />
                       </div>
                       <p className="text-slate-500 text-sm">Waiting for risk data ingestion...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <button 
            onClick={() => navigate('/doctor/submit')}
            className="flex items-center gap-4 p-6 bg-slate-900/40 border border-slate-800 rounded-2xl hover:border-teal-500/50 hover:bg-teal-500/5 transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FilePlus className="w-6 h-6 text-teal-500" />
            </div>
            <div>
              <h4 className="font-bold text-white">Submit New Report</h4>
              <p className="text-xs text-slate-500 mt-1">Log an adverse event observation</p>
            </div>
          </button>

          <button 
            onClick={() => navigate('/doctor/drugs')}
            className="flex items-center gap-4 p-6 bg-slate-900/40 border border-slate-800 rounded-2xl hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Search className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h4 className="font-bold text-white">Search Drugs</h4>
              <p className="text-xs text-slate-500 mt-1">Review safety data & trends</p>
            </div>
          </button>

          <button 
            onClick={() => navigate('/doctor/chatbot')}
            className="flex items-center gap-4 p-6 bg-slate-900/40 border border-slate-800 rounded-2xl hover:border-purple-500/50 hover:bg-purple-500/5 transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <h4 className="font-bold text-white">Ask AI Assistant</h4>
              <p className="text-xs text-slate-500 mt-1">Clinical decision support</p>
            </div>
          </button>
        </div>
      </div>
    </Layout>
  );
}
