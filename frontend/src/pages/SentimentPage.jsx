import { useState } from 'react'
import { Search, Activity, AlertTriangle, CheckCircle, ExternalLink, Loader2, Globe, BarChart3, Radio } from 'lucide-react'
import Layout from '../components/Layout'
import api from '../services/api'

const sentimentColor = {
  positive: 'text-brand-emerald bg-brand-emerald/10 border-brand-emerald/20',
  negative: 'text-brand-red bg-brand-red/10 border-brand-red/20',
  neutral:  'text-surface-500 bg-white/5 border-white/10',
}

export default function SentimentPage() {
  const [drug, setDrug]       = useState('')
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const analyse = async () => {
    if (!drug.trim()) return
    setLoading(true)
    setError('')
    setData(null)
    try {
      const res = await api.get(`/sentiment/${drug.trim().toLowerCase()}`)
      setData(res.data)
    } catch {
      setError('System failed to aggregate social sentiment metrics.')
    }
    setLoading(false)
  }

  return (
    <Layout title="Signal Surveillance: Social & Sentiment">
      <div className="max-w-5xl mx-auto space-y-10 pb-20 animate-safemed-fadein">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-brand-cyan/10 border border-brand-cyan/20 rounded-2xl flex items-center justify-center shadow-glow-cyan/10">
              <Radio className="w-7 h-7 text-brand-cyan animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight leading-none">Nocebo Signal <span className="text-brand-cyan">Detection</span></h1>
              <p className="text-[11px] text-surface-500 font-bold uppercase tracking-[0.2em] mt-3">
                Analyzing social trends to differentiate clinical signals from public fear
              </p>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="clinical-card">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-600 group-focus-within:text-brand-cyan transition-colors" />
              <input
                value={drug}
                onChange={e => setDrug(e.target.value)}
                placeholder="Target compound for sentiment audit..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-11 py-3.5 text-sm font-bold text-white placeholder-surface-600 focus:outline-none focus:border-brand-cyan/30 focus:bg-white/[0.08] transition-all"
                onKeyDown={e => e.key === 'Enter' && analyse()}
              />
            </div>
            <button
              onClick={analyse}
              disabled={loading || !drug.trim()}
              className="btn-premium px-10 py-3.5"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Activity className="w-4 h-4 mr-2" />}
              <span className="uppercase tracking-widest text-xs font-bold">{loading ? 'Analyzing Pulse...' : 'Audit Sentiment'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="clinical-card border-brand-red/30 bg-brand-red/5 flex items-center gap-4 animate-safemed-slidein">
            <AlertTriangle className="w-5 h-5 text-brand-red" />
            <p className="text-sm font-bold text-brand-red uppercase tracking-tight">{error}</p>
          </div>
        )}

        {data && (
          <div className="space-y-10 animate-safemed-fadein">

            {/* Nocebo Alert Banner */}
            <div className={`clinical-card border-l-4 p-8 flex flex-col md:flex-row items-start gap-8 relative overflow-hidden ${
              data.nocebo_flag
                ? 'border-brand-amber bg-brand-amber/5 shadow-glow-amber/5'
                : 'border-brand-emerald bg-brand-emerald/5 shadow-glow-emerald/5'
            }`}>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-premium border ${
                data.nocebo_flag ? 'bg-brand-amber/10 border-brand-amber/20 text-brand-amber' : 'bg-brand-emerald/10 border-brand-emerald/20 text-brand-emerald'
              }`}>
                {data.nocebo_flag ? <AlertTriangle className="w-8 h-8" /> : <CheckCircle className="w-8 h-8" />}
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-bold uppercase tracking-tight mb-2 ${
                  data.nocebo_flag ? 'text-brand-amber' : 'text-brand-emerald'
                }`}>
                  {data.nocebo_flag ? 'Potential Nocebo Effect Detected' : 'Clinical Signal Purity Confirmed'}
                </h3>
                <p className="text-white/80 text-base font-medium leading-relaxed max-w-4xl italic">
                  "{data.nocebo_reason}"
                </p>
              </div>
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Globe className="w-32 h-32" />
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: 'Articles Scanned', value: data.articles_found, icon: <Globe className="w-6 h-6" />, color: 'text-brand-cyan' },
                { label: 'Negative Momentum', value: data.negative_articles, icon: <BarChart3 className="w-6 h-6" />, color: 'text-brand-red' },
                { label: 'Sentiment Polarity', value: data.average_polarity ?? '0.0', icon: <Activity className="w-6 h-6" />, color: 'text-white' },
              ].map(s => (
                <div key={s.label} className="clinical-card text-center group hover:scale-105 transition-transform">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 ${s.color} group-hover:shadow-glow-blue/10`}>
                    {s.icon}
                  </div>
                  <p className={`text-4xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest mt-2">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Headlines Matrix */}
            {data.headlines?.length > 0 && (
              <div className="clinical-card">
                <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
                  <Globe className="w-5 h-5 text-brand-cyan" />
                  <h2 className="text-sm font-black text-white uppercase tracking-widest leading-none">Global Media Feed</h2>
                </div>
                
                <div className="space-y-4">
                  {data.headlines.map((h, i) => (
                    <div key={i} className="flex flex-col md:flex-row md:items-center gap-6 bg-white/[0.02] hover:bg-white/[0.04] border border-transparent hover:border-white/10 p-5 rounded-2xl transition-all group">
                      <div className={`inline-flex self-start md:self-center text-[9px] font-black px-3 py-1 rounded-lg border uppercase tracking-widest whitespace-nowrap ${sentimentColor[h.sentiment]}`}>
                        {h.sentiment} Node
                      </div>
                      <div className="flex-1 min-w-0">
                        <a
                          href={h.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-base font-bold text-white hover:text-brand-cyan flex items-center gap-2 transition-colors"
                        >
                          {h.headline}
                          <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                        <div className="flex items-center gap-3 mt-2">
                           <span className="text-[10px] font-bold text-surface-500 uppercase tracking-tighter">
                             {h.source}
                           </span>
                           <div className="w-1 h-1 rounded-full bg-white/10" />
                           <span className="text-[10px] font-bold text-surface-600 uppercase tracking-tighter">
                             {h.published}
                           </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.articles_found === 0 && (
              <div className="text-center py-20 bg-white/[0.01] rounded-3xl border-2 border-dashed border-white/5">
                <div className="w-20 h-20 mx-auto mb-6 bg-white/5 rounded-full flex items-center justify-center opacity-20">
                  <Globe className="w-10 h-10 text-white" />
                </div>
                <p className="text-base font-bold text-surface-500">Zero media saturation detected for this compound.</p>
                <p className="text-[10px] text-surface-600 font-bold uppercase mt-2 tracking-widest">Global Surveillance Nodes Idle</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
