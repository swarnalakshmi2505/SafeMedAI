import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, Database, ShieldAlert, TrendingUp, ChevronRight, Activity, Cpu, FilePlus } from 'lucide-react';

import Layout from '../../components/Layout';
import api from '../../services/api';

export default function DoctorDrugSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await api.get(`/drugs/${query.trim().toLowerCase()}`);
      setResult(response.data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(detail || 'Drug not found in database.');
    } finally {
      setLoading(false);
    }
  };

  const levelColor = (level) =>
    ({
      critical: 'text-red-400',
      high: 'text-orange-400',
      medium: 'text-yellow-400',
      low: 'text-emerald-400',
    }[level] || 'text-slate-500');

  const levelBg = (level) =>
    ({
      critical: 'bg-red-500/10 border-red-500/20',
      high: 'bg-orange-500/10 border-orange-500/20',
      medium: 'bg-yellow-500/10 border-yellow-500/20',
      low: 'bg-emerald-500/10 border-emerald-500/20',
    }[level] || 'bg-white/5 border-white/10');

  return (
    <Layout title="Drug Safety Intelligence">
      <div className="max-w-5xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
        
        {/* Header section */}
        <div className="text-center space-y-4 pt-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-[10px] font-bold text-teal-400 uppercase tracking-widest">
            <Database className="w-3 h-3" />
            Pharmacovigilance Archive
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Drug <span className="text-teal-400">Safety</span> Intelligence</h1>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Search for clinical safety data, trend analysis, and reported adverse events across our global surveillance network.
          </p>
        </div>

        {/* Search Bar Section */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-3 shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && search()}
                placeholder="Enter drug name (e.g. Warfarin, Ibuprofen...)"
                className="w-full rounded-2xl border border-transparent bg-slate-950 py-5 pl-14 pr-6 text-white placeholder-slate-600 outline-none transition-all focus:border-teal-500/30 font-medium"
              />
            </div>
            <button
              onClick={search}
              disabled={loading}
              className="bg-teal-600 hover:bg-teal-500 text-white px-10 py-5 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-teal-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
              {loading ? 'Analyzing...' : 'Search Database'}
            </button>
          </div>
        </div>

        {error ? (
          <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top duration-300">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            <p className="text-sm font-bold text-red-400 uppercase tracking-tight">{error}</p>
          </div>
        ) : null}

        {result ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Main Result Card */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row items-start justify-between gap-10">
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-teal-500/10 border border-teal-500/20 rounded-2xl flex items-center justify-center text-3xl shadow-glow-teal/10">💊</div>
                    <div>
                      <h2 className="text-3xl font-bold capitalize text-white tracking-tight">{result.drug_name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${levelBg(result.risk_level)} ${levelColor(result.risk_level)}`}>
                          {result.risk_level} Risk Level
                        </span>
                        <div className="w-1 h-1 rounded-full bg-slate-700" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Monitoring</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-300">{result.explanation}</p>
                </div>
                <div className="w-full md:w-auto bg-black/30 border border-slate-800 rounded-2xl p-8 text-center min-w-[200px]">
                  <div className="text-4xl font-bold text-teal-400 mb-1">{result.risk_score}%</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Safety Risk Score</div>
                  <div className="mt-4 h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${
                        result.risk_score >= 70 ? 'bg-red-500' : 
                        result.risk_score >= 50 ? 'bg-orange-500' : 
                        'bg-teal-500'
                      }`}
                      style={{ width: `${result.risk_score}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/doctor/submit', { state: { prefillDrug: result.drug_name } })}
                  className="flex-1 bg-teal-600 hover:bg-teal-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-teal-900/20"
                >
                  <FilePlus className="w-5 h-5" />
                  Report Adverse Event for {result.drug_name}
                </button>
                <button
                  onClick={() => navigate(`/doctor/drugs/${encodeURIComponent(result.drug_name)}`)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all"
                >
                  View Full Detail Study
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Reporting Odds Ratio', value: result.strongest_ror, suffix: ' ROR', color: 'text-teal-400', icon: <TrendingUp className="w-4 h-4" /> },
                { label: 'Observed Mortality', value: `${result.death_rate}%`, suffix: '', color: 'text-red-400', icon: <ShieldAlert className="w-4 h-4" /> },
                { label: 'Event Signal Density', value: result.signal_count, suffix: ' Signals', color: 'text-orange-400', icon: <Activity className="w-4 h-4" /> },
              ].map((stat) => (
                <div key={stat.label} className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center space-y-2 group hover:border-teal-500/30 transition-all duration-300">
                  <div className={`p-2 rounded-lg bg-slate-800 mb-2 ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}{stat.suffix}</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Matrix Section */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-teal-500/10 border border-teal-500/20 rounded-lg text-teal-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Analytical Surveillance Matrix</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Real-time signal cross-reference from global clinical nodes</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 rounded-2xl bg-black/20 border border-slate-800 flex items-center justify-between group hover:border-teal-500/20 transition-all">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Trend Direction</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-white font-bold text-lg capitalize">{result.trend_direction}</span>
                      <span className="text-teal-400 text-xs font-bold px-2 py-0.5 bg-teal-400/10 rounded-full border border-teal-400/20">
                        {result.trend_magnitude}
                      </span>
                    </div>
                  </div>
                  <TrendingUp className="w-10 h-10 text-white/5 group-hover:text-teal-500/5 transition-colors" />
                </div>
                <div className="p-6 rounded-2xl bg-black/20 border border-slate-800 flex items-center justify-between group hover:border-teal-500/20 transition-all">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Clinical Reliability</span>
                    <p className="text-white font-bold text-lg mt-1">Verified Clinical Signal</p>
                  </div>
                  <ShieldAlert className="w-10 h-10 text-white/5 group-hover:text-teal-500/5 transition-colors" />
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  );
}
