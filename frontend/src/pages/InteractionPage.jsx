import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, AlertTriangle, CheckCircle, Search, Loader2 } from 'lucide-react'
import Layout from '../components/Layout'
import { advancedAPI } from '../services/api'
import RiskRing from '../components/RiskRing'

const severityConfig = {
  severe:   { color: 'text-red-600',    bg: 'bg-red-50 border-red-200',    icon: '🚨', label: 'Severe Interaction'   },
  moderate: { color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', icon: '⚠️', label: 'Moderate Interaction'  },
  mild:     { color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200', icon: '⚡', label: 'Mild Interaction'      },
  none:     { color: 'text-green-600',  bg: 'bg-green-50 border-green-200',  icon: '✅', label: 'No Significant Interaction' },
}

export default function InteractionPage() {
  const navigate    = useNavigate()
  const [drugA,     setDrugA]   = useState('')
  const [drugB,     setDrugB]   = useState('')
  const [result,    setResult]  = useState(null)
  const [loading,   setLoading] = useState(false)
  const [error,     setError]   = useState('')

  const check = async () => {
    if (!drugA.trim() || !drugB.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await advancedAPI.getInteraction(
        drugA.trim().toLowerCase(),
        drugB.trim().toLowerCase()
      )
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Interaction check failed.')
    } finally {
      setLoading(false)
    }
  }

  const sc = result ? (severityConfig[result.severity] || severityConfig.none) : null

  return (
    <Layout title="Interaction Intelligence">
      <div className="max-w-4xl mx-auto space-y-8 animate-safemed-fadein">

        {/* Header Section */}
        <div className="flex items-center gap-4 mb-2 animate-safemed-slidein">
          <div className="w-12 h-12 bg-white border border-medical-100 rounded-2xl flex items-center justify-center shadow-soft animate-safemed-float">
            <Zap className="w-6 h-6 text-medical-600" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">Synergy & Antagonism Analysis</h1>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">
              Dual-compound signal correlation engine
            </p>
          </div>
        </div>

        {/* Input Card */}
        <div className="safemed-card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Compound Alpha</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input
                  value={drugA}
                  onChange={e => setDrugA(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && check()}
                  placeholder="e.g. warfarin"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-11 py-3.5 text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-medical-500 focus:bg-white transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Compound Beta</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input
                  value={drugB}
                  onChange={e => setDrugB(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && check()}
                  placeholder="e.g. aspirin"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-11 py-3.5 text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-medical-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          <button
            onClick={check}
            disabled={loading || !drugA.trim() || !drugB.trim()}
            className="w-full bg-medical-500 hover:bg-medical-600 disabled:opacity-50 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-medical-500/20 active:scale-95 flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-4 h-4" />}
            {loading ? 'Processing Multi-Signal Matrix...' : 'Execute Correlation Check'}
          </button>

          {/* Examples */}
          <div className="mt-6 pt-6 border-t border-slate-50 flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Stubs:</span>
            <div className="flex flex-wrap gap-2">
              {[
                ['warfarin', 'aspirin'],
                ['metformin', 'ibuprofen'],
                ['sertraline', 'tramadol'],
              ].map(([a, b]) => (
                <button
                  key={`${a}-${b}`}
                  onClick={() => { setDrugA(a); setDrugB(b) }}
                  className="text-[10px] font-bold bg-medical-50 hover:bg-medical-100 border border-medical-100 text-medical-700 px-3 py-1.5 rounded-lg transition-all"
                >
                  {a} + {b}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 text-xs font-bold flex items-center gap-3 animate-safemed-slidein">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Result UI */}
        {result && sc && (
          <div className="space-y-6 animate-safemed-fadein">

            {/* Severity Card */}
            <div className={`border-2 rounded-3xl p-8 ${sc.bg} relative overflow-hidden group`}>
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white opacity-20 transition-transform duration-700 group-hover:scale-150" />
              
              <div className="flex items-start gap-6 mb-6">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-4xl shadow-soft">
                  {sc.icon}
                </div>
                <div className="flex-1">
                  <h2 className={`text-2xl font-black tracking-tight ${sc.color} uppercase`}>
                    {sc.label}
                  </h2>
                  <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">
                    Interaction Matrix: <span className="text-slate-900">{result.drug_a}</span> + <span className="text-slate-900">{result.drug_b}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-4xl font-black ${sc.color}`}>
                    {result.risk_amplification}
                  </p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Amplification Factor</p>
                </div>
              </div>
              
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-5 border border-white/60">
                <p className="text-slate-700 text-sm font-medium leading-relaxed">
                  {result.summary}
                </p>
              </div>
            </div>

            {/* Component Risk Profile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: result.drug_a, score: result.drug_a_score, reactions: result.drug_a_reactions },
                { name: result.drug_b, score: result.drug_b_score, reactions: result.drug_b_reactions },
              ].map((drug, i) => (
                <div key={drug.name}
                  onClick={() => navigate(`/officer/drug/${drug.name}`)}
                  className="safemed-card safemed-card-hover group cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="capitalize text-lg font-black text-slate-900 group-hover:text-medical-600 transition-colors">{drug.name}</div>
                    <RiskRing score={drug.score} size={52} />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {drug.reactions.slice(0, 3).map(r => (
                      <span key={r} className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-md uppercase tracking-tighter">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Signal Intersection */}
            {result.shared_reactions.length > 0 && (
              <div className="safemed-card">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500 font-black">⚡</div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Shared ADR Matrix</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">Intersection of adverse event profiles</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {result.shared_reactions.map((r, i) => (
                    <span key={i} className="bg-orange-50 border border-orange-100 text-orange-700 text-xs font-bold px-4 py-2 rounded-xl shadow-soft">
                      {r}
                    </span>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-orange-50/30 rounded-xl border border-dashed border-orange-200">
                  <p className="text-[11px] text-orange-700 font-medium italic">
                    Note: These reactions appear in both clinical profiles. Simultaneous administration may lead to non-linear escalation of these specific signals.
                  </p>
                </div>
              </div>
            )}

            {/* AI Action */}
            <button
              onClick={() => navigate('/officer/chatbot', {
                state: { drugContext: `${result.drug_a} and ${result.drug_b} interaction` }
              })}
              className="w-full bg-medical-50 border border-medical-100 hover:bg-medical-100 text-medical-700 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              Consult PV Assistant about this Matrix →
            </button>
          </div>
        )}
      </div>
    </Layout>
  )
}
