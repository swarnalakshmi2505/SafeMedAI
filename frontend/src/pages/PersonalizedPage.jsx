import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, AlertTriangle, Search, Activity, Bot, Loader2 } from 'lucide-react'
import Layout from '../components/Layout'
import { advancedAPI } from '../services/api'
import RiskRing from '../components/RiskRing'

export default function PersonalizedPage() {
  const navigate  = useNavigate()
  const [form,    setForm]    = useState({ drug: '', age: '', gender: 'male' })
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const analyze = async () => {
    if (!form.drug || !form.age) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await advancedAPI.getPersonalized(
        form.drug.toLowerCase(), parseInt(form.age), form.gender
      )
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Patient profile analysis failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title="Patient-Specific Intelligence">
      <div className="max-w-4xl mx-auto space-y-8 animate-safemed-fadein">
        
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-2 animate-safemed-slidein">
          <div className="w-12 h-12 bg-white border border-medical-100 rounded-2xl flex items-center justify-center shadow-soft animate-safemed-float">
            <User className="w-6 h-6 text-medical-600" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none uppercase">Demographic Variance Engine</h1>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">
              Risk analysis adjusted for age and gender disproportionality
            </p>
          </div>
        </div>

        {/* Input Form */}
        <div className="safemed-card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-1 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Compound</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input
                  value={form.drug}
                  onChange={e => setForm(p => ({...p, drug: e.target.value}))}
                  placeholder="e.g. metformin"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-11 py-3.5 text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-medical-500 focus:bg-white transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Patient Age</label>
              <input
                type="number" min="1" max="120"
                value={form.age}
                onChange={e => setForm(p => ({...p, age: e.target.value}))}
                placeholder="Years"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-medical-500 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender Node</label>
              <select
                value={form.gender}
                onChange={e => setForm(p => ({...p, gender: e.target.value}))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-[15px] text-sm font-bold text-slate-900 focus:outline-none focus:border-medical-500 transition-all cursor-pointer"
              >
                <option value="male">Male Population</option>
                <option value="female">Female Population</option>
                <option value="unknown">Non-Specified</option>
              </select>
            </div>
          </div>
          <button
            onClick={analyze}
            disabled={loading || !form.drug || !form.age}
            className="w-full bg-medical-500 hover:bg-medical-600 disabled:opacity-50 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-medical-500/20 active:scale-95 flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Activity className="w-4 h-4" />}
            {loading ? 'Processing Demographic Matrix...' : 'Run Adjusted Risk Analysis'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 text-xs font-bold flex items-center gap-3 animate-safemed-slidein">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Results Matrix */}
        {result && (
          <div className="space-y-6 animate-safemed-fadein">

            {/* Comparison Card */}
            <div className="safemed-card border-l-8 border-medical-500 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-medical-50 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-700" />
              
              <h2 className="text-base font-black text-slate-900 uppercase tracking-tight mb-8">
                Variance Matrix: <span className="text-medical-600">{result.drug_name}</span> · {result.age}Y {result.gender}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                <div className="flex flex-col items-center">
                  <RiskRing score={result.base_risk_score} size={90} />
                  <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Base Signal</p>
                  <span className="text-xs font-bold text-slate-500">General Population</span>
                </div>
                <div className="flex flex-col items-center">
                  <RiskRing score={result.adjusted_score} size={110} />
                  <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Adjusted Intensity</p>
                  <span className="text-xs font-black text-medical-600 uppercase tracking-widest">Specific Demographic</span>
                </div>
              </div>

              <div className="mt-10 p-5 bg-medical-50/50 rounded-2xl border border-medical-100">
                <p className="text-slate-700 text-sm font-medium leading-relaxed italic">
                  "{result.recommendation}"
                </p>
              </div>
            </div>

            {/* Warnings Section */}
            {result.warnings?.length > 0 && (
              <div className="bg-orange-50 border-2 border-orange-100 rounded-3xl p-6 shadow-soft">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-soft">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                  </div>
                  <h3 className="text-sm font-black text-orange-700 uppercase tracking-widest">
                    Demographic Alerts
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.warnings.map((w, i) => (
                    <div key={i} className="flex gap-3 bg-white/50 p-4 rounded-xl border border-orange-200/50">
                      <span className="text-orange-500 font-black">→</span>
                      <p className="text-orange-900 text-xs font-bold leading-relaxed">{w}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reaction Matrix */}
            {result.top_reactions_for_demo?.length > 0 && (
              <div className="safemed-card">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-medical-50 rounded-lg flex items-center justify-center text-medical-600 font-black">🧬</div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Specific ADR Clustering</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">Based on {result.demo_reports} targeted FAERS reports</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {result.top_reactions_for_demo.map((r, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 px-2 rounded-lg transition-colors">
                      <span className="text-slate-700 text-sm font-bold capitalize">{r.reaction}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-medical-500 rounded-full" 
                            style={{ width: `${Math.min(100, (r.count / result.demo_reports) * 1000)}%` }} 
                          />
                        </div>
                        <span className="text-medical-600 text-[11px] font-black w-16 text-right">{r.count} Nodes</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Final Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => navigate(`/officer/drug/${result.drug_name}`)}
                className="bg-white border border-slate-200 hover:border-medical-400 text-slate-900 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98]"
              >
                Deep Profile Analysis →
              </button>
              <button
                onClick={() => navigate('/officer/chatbot', { state: { drugContext: result.drug_name } })}
                className="bg-medical-50 border border-medical-200 hover:bg-medical-100 text-medical-700 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <Bot className="w-4 h-4" /> Consult PV Assistant
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
