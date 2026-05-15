import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';

import Layout from '../components/Layout';
import api from '../services/api';
import RiskRing from '../components/RiskRing';

export default function DrugSearchPage() {
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
      setError(detail || 'Drug not found in database. Try running data ingestion first.');
    } finally {
      setLoading(false);
    }
  };

  const levelColor = (level) =>
    ({
      critical: 'text-red-600',
      high: 'text-orange-600',
      medium: 'text-yellow-600',
      low: 'text-green-600',
    }[level] || 'text-slate-500');

  return (
    <Layout title="Drug Intelligence Search">
      <div className="max-w-4xl mx-auto space-y-8 animate-safemed-fadein">
        
        {/* Search Bar Section */}
        <div className="safemed-card">
          <div className="flex gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-medical-500 transition-colors" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && search()}
                placeholder="Query clinical compound (e.g. warfarin, ibuprofen, metformin...)"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-medical-500 focus:bg-white focus:shadow-soft font-medium"
              />
            </div>
            <button
              onClick={search}
              disabled={loading}
              className="rounded-xl bg-medical-500 px-8 py-3.5 font-bold text-white transition-all hover:bg-medical-600 disabled:opacity-50 shadow-lg shadow-medical-500/20 active:scale-95 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Analyzing...' : 'Execute Search'}
            </button>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700 animate-safemed-slidein flex items-center gap-3">
            <span className="text-xl">⚠️</span> {error}
          </div>
        ) : null}

        {result ? (
          <div className="space-y-6 animate-safemed-fadein">
            {/* Main Result Card */}
            <div className="safemed-card border-l-4 border-medical-500">
              <div className="flex items-start justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-medical-50 rounded-xl flex items-center justify-center text-xl shadow-soft">💊</div>
                    <h2 className="text-2xl font-black capitalize text-slate-900 tracking-tight">{result.drug_name}</h2>
                  </div>
                  <p className="text-sm leading-7 text-slate-600 font-medium">{result.explanation}</p>
                </div>
                <div className="flex-shrink-0 flex flex-col items-center">
                  <RiskRing score={result.risk_score} size={84} />
                  <span className={`mt-3 block text-[10px] font-black uppercase tracking-widest ${levelColor(result.risk_level)}`}>
                    {result.risk_level} Risk
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Primary ROR Signal', value: result.strongest_ror, suffix: 'x Ratio', color: 'text-medical-600' },
                { label: 'Mortality Association', value: `${result.death_rate}%`, suffix: '', color: 'text-red-600' },
                { label: 'Serious Event Rate', value: `${result.serious_rate}%`, suffix: '', color: 'text-orange-600' },
              ].map((stat) => (
                <div key={stat.label} className="safemed-card p-4 text-center hover:border-medical-200 transition-colors">
                  <p className={`text-xl font-black ${stat.color}`}>{stat.value}{stat.suffix}</p>
                  <p className="mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Evidence Summary Card */}
            <div className="safemed-card">
              <div className="mb-6 flex items-center justify-between border-b border-slate-50 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-none">Evidence Intelligence</h3>
                  <p className="text-[11px] text-slate-400 font-medium mt-1">Consolidated signal metrics from FDA FAERS</p>
                </div>
                <div className="bg-medical-50 text-medical-600 px-3 py-1 rounded-lg text-[10px] font-bold border border-medical-100 uppercase tracking-wider">
                  {result.signal_count} Active Signals
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-8 text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Temporal Trend</span>
                  <span className="text-slate-700 font-bold capitalize">
                    {result.trend_direction} <span className="text-medical-500 ml-1">({result.trend_magnitude})</span>
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Signal Density</span>
                  <span className="text-slate-700 font-bold">{result.signal_count} Verified Safety Signals</span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/officer/drug/${encodeURIComponent(result.drug_name)}`)}
                className="mt-8 w-full rounded-xl bg-medical-500 px-6 py-3 font-bold text-white transition-all hover:bg-medical-600 shadow-lg shadow-medical-500/20 active:scale-[0.98]"
              >
                View Deep Analytical Profile →
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  );
}
