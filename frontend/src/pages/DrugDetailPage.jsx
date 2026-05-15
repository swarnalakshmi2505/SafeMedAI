import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { Bot, Zap, ArrowLeft, Pill, FileText, Activity, AlertTriangle, CheckCircle } from 'lucide-react'
import Layout from '../components/Layout'
import api    from '../services/api'
import RiskRing from '../components/RiskRing'

const signalBadge = (sig, confirmed) => {
  if (!confirmed) return 'text-slate-400 bg-slate-100 border-slate-200'
  if (sig === 'strong')   return 'text-red-600 bg-red-50 border-red-200'
  if (sig === 'moderate') return 'text-orange-600 bg-orange-50 border-orange-200'
  return                         'text-medical-600 bg-medical-50 border-medical-100'
}

function Section({ title, icon: Icon, children, className = "" }) {
  return (
    <div className={`safemed-card ${className}`}>
      <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-3">
        {Icon && <Icon className="w-4 h-4 text-medical-500" />}
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          {title}
        </h3>
      </div>
      {children}
    </div>
  )
}

export default function DrugDetailPage() {
  const { drugName } = useParams()
  const navigate     = useNavigate()
  const [drug,    setDrug]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    if (!drugName) return
    setLoading(true); setError('')
    api.get(`/drugs/${drugName.toLowerCase()}`)
      .then(r => setDrug(r.data))
      .catch(err => {
        setError(err.response?.data?.detail || 'Failed to load clinical drug profile.')
      })
      .finally(() => setLoading(false))
  }, [drugName])

  if (loading) return (
    <Layout title="Clinical Intelligence">
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-medical-100 border-t-medical-500 rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-medical-600 uppercase tracking-widest animate-pulse">Syncing Signal Data...</p>
      </div>
    </Layout>
  )

  if (error || !drug) return (
    <Layout title="System Error">
      <div className="max-w-2xl mx-auto mt-12 animate-safemed-slidein">
        <button onClick={() => navigate(-1)}
          className="text-slate-400 hover:text-medical-600 font-bold text-xs mb-6 flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-8 text-center">
          <div className="text-4xl mb-4">🚫</div>
          <h2 className="text-xl font-black text-red-700 mb-2">Profile Retrieval Failure</h2>
          <p className="text-red-600 text-sm font-medium mb-6">{error || 'Data node unreachable'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
          >
            Retry Protocol
          </button>
        </div>
      </div>
    </Layout>
  )

  return (
    <Layout title={`${drug.drug_name} Intelligence Profile`}>
      <div className="max-w-6xl mx-auto space-y-8 animate-safemed-fadein">

        {/* Navigation & Actions */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)}
            className="text-slate-500 hover:text-medical-600 font-bold text-xs flex items-center gap-2 transition-all hover:-translate-x-1">
            <ArrowLeft className="w-4 h-4" /> Return to Signal Feed
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/officer/chatbot', { state: { drugContext: drug.drug_name } })}
              className="flex items-center gap-2 bg-medical-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-medical-600 transition-all shadow-lg shadow-medical-500/20 active:scale-95"
            >
              <Bot className="w-4 h-4" /> Consult AI Assistant
            </button>
            <button
              onClick={() => navigate('/officer/interaction')}
              className="flex items-center gap-2 bg-white border border-medical-200 text-medical-600 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-medical-50 transition-all active:scale-95"
            >
              <Zap className="w-4 h-4" /> Cross-Interaction Check
            </button>
          </div>
        </div>

        {/* ── Hero Card ── */}
        <div className="safemed-card border-l-8 border-medical-500 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-medical-50 rounded-full -mr-32 -mt-32 opacity-50 pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:items-center gap-8 relative z-10">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-medical-50 rounded-2xl flex items-center justify-center text-3xl shadow-soft">💊</div>
                <div>
                  <h1 className="text-4xl font-black text-slate-900 capitalize tracking-tight leading-none">
                    {drug.drug_name}
                  </h1>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-medical-500" />
                    FDA Pharmacovigilance Node · ID: {drug.id || 'N/A'}
                  </p>
                </div>
              </div>
              <p className="text-slate-600 text-sm font-medium leading-relaxed max-w-2xl">
                {drug.explanation}
              </p>
            </div>

            {/* Risk Intensity Ring */}
            <div className="flex-shrink-0 flex flex-col items-center bg-white p-6 rounded-3xl shadow-soft border border-medical-50">
              <RiskRing score={drug.risk_score} size={110} />
              <div className="mt-4 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                  Combined Risk Intensity
                </p>
                <span className={`text-xs font-black uppercase tracking-widest
                  ${drug.risk_level === 'critical' ? 'text-red-600' : drug.risk_level === 'high' ? 'text-orange-600' : 'text-medical-600'}`}>
                  {drug.risk_level} Priority
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            {[
              { label: 'Max ROR Ratio', value: `${drug.strongest_ror}x`, color: 'text-medical-600' },
              { label: 'Mortality Rate', value: `${drug.death_rate}%`, color: 'text-red-600' },
              { label: 'Serious Events', value: `${drug.serious_rate}%`, color: 'text-orange-600' },
              { label: 'Confirmed Signals', value: drug.signal_count, color: 'text-purple-600' },
            ].map(m => (
              <div key={m.label} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center group hover:bg-white hover:border-medical-200 transition-all">
                <p className={`text-2xl font-black ${m.color}`}>{m.value}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{m.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Main Intel Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Usage & Clinical Data */}
          <div className="lg:col-span-2 space-y-8">
            
            <Section title="Therapeutic Intent" icon={Pill}>
              <p className="text-slate-700 text-sm font-medium leading-relaxed">
                {drug.uses}
              </p>
            </Section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Section title="Clinical Benefits" icon={CheckCircle}>
                <p className="text-slate-700 text-sm font-medium leading-relaxed">
                  {drug.pros}
                </p>
              </Section>
              <Section title="Signals & ADRs" icon={AlertTriangle}>
                <p className="text-slate-700 text-sm font-medium leading-relaxed">
                  {drug.cons}
                </p>
              </Section>
            </div>

            {/* ROR Signal Table */}
            <Section title="Disproportionality Matrix (ROR Signals)" icon={Activity}>
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Adverse Event</th>
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ROR Ratio</th>
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Signal Intensity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {drug.ror_signals?.map((sig, i) => (
                      <tr key={i} className="group hover:bg-slate-50 transition-colors">
                        <td className="py-4 text-sm font-bold text-slate-700 capitalize">{sig.reaction}</td>
                        <td className="py-4 font-black text-medical-600 text-base">{sig.ror}</td>
                        <td className="py-4 text-center">
                          <span className={`text-[10px] font-black px-3 py-1 rounded-lg border uppercase tracking-wider
                            ${signalBadge(sig.signal, sig.confirmed)}`}>
                            {sig.signal} {sig.confirmed ? '✓' : ''}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            {/* Trend Chart */}
            {drug.yearly_trends?.length > 0 && (
              <Section title="Temporal Surveillance Trend" icon={Activity}>
                <div className="h-[280px] mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={drug.yearly_trends}>
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
              </Section>
            )}
          </div>

          {/* Right: Demographics & Evidence */}
          <div className="space-y-8">
            
            <Section title="Contraindications" icon={AlertTriangle}>
              <p className="text-slate-700 text-xs font-bold leading-relaxed italic bg-red-50/50 p-4 rounded-xl border border-red-100">
                {drug.who_should_avoid}
              </p>
            </Section>

            {/* Evidence Pulse */}
            <Section title="Evidence Nodes" icon={FileText}>
              <div className="space-y-3 mt-4">
                {[
                  { label: 'FDA Drug Label Node', status: drug.evidence?.fda_label ? '✓ Active' : '— Null', active: !!drug.evidence?.fda_label },
                  { label: 'PubMed Archive', value: `${drug.evidence?.pubmed_count || 0} Papers`, active: true },
                  { label: 'FAERS Repository', value: `${drug.evidence?.faers_reports?.toLocaleString() || 0} Reports`, active: true },
                ].map(ev => (
                  <div key={ev.label} className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{ev.label}</span>
                    <span className={`text-[10px] font-black uppercase ${ev.active ? 'text-medical-600' : 'text-slate-400'}`}>
                      {ev.status || ev.value}
                    </span>
                  </div>
                ))}
              </div>
            </Section>

            {/* Safer Alternatives */}
            {drug.alternatives?.length > 0 && (
              <Section title="Suggested Alternative Matrix" icon={CheckCircle}>
                <div className="space-y-4">
                  {drug.alternatives.map((alt) => (
                    <div
                      key={alt.drug_name}
                      onClick={() => navigate(`/officer/drug/${alt.drug_name}`)}
                      className="bg-white border border-medical-100 p-4 rounded-2xl hover:border-medical-400 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-black text-slate-900 capitalize group-hover:text-medical-600">
                          {alt.drug_name}
                        </span>
                        <RiskRing score={alt.risk_score} size={36} strokeWidth={4} />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {alt.top_reactions?.slice(0, 2).map(r => (
                          <span key={r} className="text-[8px] font-black bg-medical-50 text-medical-600 px-1.5 py-0.5 rounded-md uppercase">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>

        </div>

      </div>
    </Layout>
  )
}
