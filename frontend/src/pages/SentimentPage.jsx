import { useState } from 'react'
import { Search, Activity, AlertTriangle, CheckCircle, ExternalLink, Loader2 } from 'lucide-react'
import Layout from '../components/Layout'
import api from '../services/api'

const sentimentColor = {
  positive: 'text-green-600 bg-green-50 border-green-100',
  negative: 'text-red-600 bg-red-50 border-red-100',
  neutral:  'text-slate-500 bg-slate-50 border-slate-200',
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
      <div className="max-w-4xl mx-auto space-y-8 animate-safemed-fadein">
        
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-2 animate-safemed-slidein">
          <div className="w-12 h-12 bg-white border border-medical-100 rounded-2xl flex items-center justify-center shadow-soft animate-safemed-float">
            <Activity className="w-6 h-6 text-medical-600" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none uppercase">Nocebo Signal Detection</h1>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">
              Analyzing social trends to differentiate clinical signals from public fear
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="safemed-card">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input
                value={drug}
                onChange={e => setDrug(e.target.value)}
                placeholder="Target compound for sentiment audit..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-11 py-3.5 text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-medical-500 focus:bg-white transition-all"
                onKeyDown={e => e.key === 'Enter' && analyse()}
              />
            </div>
            <button
              onClick={analyse}
              disabled={loading || !drug.trim()}
              className="bg-medical-500 hover:bg-medical-600 disabled:opacity-50 text-white px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-medical-500/20 active:scale-95 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
              {loading ? 'Analyzing Pulse...' : 'Audit Sentiment'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 text-xs font-bold flex items-center gap-3 animate-safemed-slidein">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {data && (
          <div className="space-y-6 animate-safemed-fadein">

            {/* Nocebo Alert Banner */}
            <div className={`rounded-3xl border-2 p-6 flex items-start gap-5 shadow-soft transition-all ${
              data.nocebo_flag
                ? 'bg-amber-50 border-amber-200'
                : 'bg-green-50 border-green-200'
            }`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-soft ${
                data.nocebo_flag ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
              }`}>
                {data.nocebo_flag ? '⚠️' : '✅'}
              </div>
              <div className="flex-1">
                <h3 className={`text-base font-black uppercase tracking-tight mb-1 ${
                  data.nocebo_flag ? 'text-amber-800' : 'text-green-800'
                }`}>
                  {data.nocebo_flag ? 'Nocebo Effect Suspected' : 'Clinical Signal Purity Confirmed'}
                </h3>
                <p className={`text-sm font-medium leading-relaxed ${
                  data.nocebo_flag ? 'text-amber-700' : 'text-green-700'
                }`}>
                  {data.nocebo_reason}
                </p>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Articles Scanned', value: data.articles_found, icon: '📰', color: 'text-medical-600' },
                { label: 'Negative Momentum', value: data.negative_articles, icon: '📉', color: 'text-red-600' },
                { label: 'Sentiment Polarity', value: data.average_polarity ?? '0.0', icon: '⚖️', color: 'text-slate-700' },
              ].map(s => (
                <div key={s.label} className="bg-white border border-medical-100 rounded-2xl p-5 text-center group hover:border-medical-400 transition-all shadow-soft">
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Headlines Matrix */}
            {data.headlines?.length > 0 && (
              <div className="safemed-card">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-medical-50 rounded-lg flex items-center justify-center text-medical-600 font-black">🌍</div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Global Media Feed</h2>
                </div>
                
                <div className="space-y-3">
                  {data.headlines.map((h, i) => (
                    <div key={i} className="flex flex-col md:flex-row md:items-center gap-4 bg-slate-50/50 hover:bg-white border border-transparent hover:border-medical-100 p-4 rounded-2xl transition-all group">
                      <div className={`inline-flex self-start md:self-center text-[9px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider whitespace-nowrap ${sentimentColor[h.sentiment]}`}>
                        {h.sentiment}
                      </div>
                      <div className="flex-1 min-w-0">
                        <a
                          href={h.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-bold text-slate-900 hover:text-medical-600 flex items-center gap-2 transition-colors"
                        >
                          {h.headline}
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">
                          {h.source} · {h.published}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.articles_found === 0 && (
              <div className="text-center py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-2xl mb-2">🔭</p>
                <p className="text-sm font-bold text-slate-500">Zero media saturation detected for this compound.</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Check NewsAPI integration status in configuration</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
