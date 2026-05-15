import { useEffect, useState } from 'react'
import { 
  Bell, 
  ShieldAlert, 
  CheckCircle, 
  RefreshCcw, 
  Activity, 
  ChevronRight, 
  Terminal,
  ShieldCheck,
  Zap,
  Eye,
  Cpu
} from 'lucide-react'
import Layout from '../components/Layout'
import api from '../services/api'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/alerts')
      setAlerts(res.data)
    } catch (err) {
      console.error("Error fetching alerts:", err)
    } finally {
      setLoading(false)
    }
  }

  const generateAlerts = async () => {
    setGenerating(true)
    try {
      await api.post('/alerts/generate')
      await fetchAlerts()
    } catch (err) {
      console.error("Error generating alerts:", err)
    } finally {
      setGenerating(false)
    }
  }

  const markReviewed = async (id) => {
    try {
      await api.patch(`/alerts/${id}/review`)
      setAlerts(prev =>
        prev.map(a => a.id === id ? { ...a, is_reviewed: true } : a)
      )
    } catch (err) {
      console.error("Error marking alert as reviewed:", err)
    }
  }

  useEffect(() => { fetchAlerts() }, [])

  const unreviewed = alerts.filter(a => !a.is_reviewed)
  const reviewed   = alerts.filter(a => a.is_reviewed)

  const levelColor = (level) =>
    ({
      critical: 'text-brand-red',
      high: 'text-brand-amber',
      medium: 'text-brand-blue',
    }[level] || 'text-surface-500');

  const levelBg = (level) =>
    ({
      critical: 'bg-brand-red/10 border-brand-red/20',
      high: 'bg-brand-amber/10 border-brand-amber/20',
      medium: 'bg-brand-blue/10 border-brand-blue/20',
    }[level] || 'bg-white/5 border-white/10');

  return (
    <Layout title="Signal Command Center">
      <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-safemed-fadein">

        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-brand-red/10 border border-brand-red/20 rounded-2xl flex items-center justify-center shadow-glow-red/10">
              <ShieldAlert className="w-8 h-8 text-brand-red animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Signal <span className="text-brand-red">Command</span> Center</h1>
              <p className="text-[11px] text-surface-500 font-bold uppercase tracking-[0.2em] mt-3">
                {unreviewed.length} Priority Clinical Signals Pending Surveillance Review
              </p>
            </div>
          </div>
          <button
            onClick={generateAlerts}
            disabled={generating}
            className="btn-premium px-8 py-4 flex items-center gap-3 disabled:opacity-50 active:scale-95 transition-all"
          >
            {generating ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
            <span className="uppercase tracking-[0.15em] text-xs font-bold">
              {generating ? 'Scanning Clinical Clusters...' : 'Initialize Signal Scan'}
            </span>
          </button>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <RefreshCcw className="w-12 h-12 text-brand-blue animate-spin opacity-40" />
            <p className="text-[10px] font-bold text-surface-500 uppercase tracking-[0.3em]">Synching with Global Database Node...</p>
          </div>
        )}

        {/* Unreviewed Signals */}
        {unreviewed.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xs font-bold text-surface-500 uppercase tracking-[0.2em]">Active Threat Vectors</h2>
              <span className="text-[10px] font-bold text-brand-red animate-pulse">LIVE SURVEILLANCE ACTIVE</span>
            </div>
            <div className="space-y-4">
              {unreviewed.map(alert => (
                <div
                  key={alert.id}
                  className={`clinical-card border-l-4 group animate-safemed-slidein ${
                    alert.level === 'critical' ? 'border-brand-red' : alert.level === 'high' ? 'border-brand-amber' : 'border-brand-blue'
                  }`}
                >
                  <div className="flex items-start justify-between gap-8">
                    <div className="flex items-start gap-6 flex-1">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl shadow-premium border ${levelBg(alert.level)} ${levelColor(alert.level)}`}>
                        {alert.level === 'critical' ? <ShieldAlert className="w-8 h-8" /> : alert.level === 'high' ? <Activity className="w-8 h-8" /> : <Zap className="w-8 h-8" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <span className="text-xl font-bold text-white capitalize group-hover:text-brand-cyan transition-colors">
                            {alert.drug_name}
                          </span>
                          <span className={`text-[9px] font-black px-2.5 py-1 rounded border uppercase tracking-widest ${levelBg(alert.level)} ${levelColor(alert.level)}`}>
                            {alert.level} Signal
                          </span>
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                            <span className="text-[9px] font-bold text-surface-500 uppercase">ROR:</span>
                            <span className="text-[10px] font-mono text-brand-cyan font-bold">{alert.risk_score}</span>
                          </div>
                        </div>
                        <p className="text-white/70 text-sm font-medium leading-relaxed max-w-3xl italic">"{alert.message}"</p>
                        <div className="flex items-center gap-6 mt-4">
                          <div className="flex items-center gap-2">
                            <Terminal className="w-3 h-3 text-surface-500" />
                            <span className="text-[10px] font-bold text-surface-500 uppercase tracking-tighter">
                              {new Date(alert.created_at).toLocaleString()}
                            </span>
                          </div>
                          <div className="w-1.5 h-1.5 rounded-full bg-white/5" />
                          <span className="text-[10px] font-bold text-surface-500 uppercase tracking-tighter">NODE ID: PV-{alert.id.toString().slice(-6)}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => markReviewed(alert.id)}
                      className="flex-shrink-0 bg-white/5 border border-white/10 text-surface-400 hover:bg-brand-emerald/10 hover:border-brand-emerald/30 hover:text-brand-emerald px-6 py-3 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest"
                    >
                      <CheckCircle className="w-4 h-4 inline mr-2" />
                      Clear Signal
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviewed History */}
        {reviewed.length > 0 && (
          <div className="space-y-6 pt-10 border-t border-white/[0.05]">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xs font-bold text-surface-500 uppercase tracking-[0.2em]">Validated History</h2>
              <span className="text-[10px] font-bold text-surface-500 uppercase">ARCHIVED NODES</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
              {reviewed.map(alert => (
                <div
                  key={alert.id}
                  className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-5 flex items-center gap-4 group hover:bg-white/[0.04] transition-all"
                >
                  <div className="p-2 bg-brand-emerald/10 border border-brand-emerald/20 rounded-lg text-brand-emerald">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-white capitalize block truncate group-hover:text-brand-emerald transition-colors">
                      {alert.drug_name}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[8px] font-bold uppercase tracking-widest ${levelColor(alert.level)}`}>
                        {alert.level}
                      </span>
                      <div className="w-1 h-1 rounded-full bg-white/5" />
                      <span className="text-[8px] font-bold text-surface-500 uppercase tracking-tighter">
                        Archived: {new Date(alert.updated_at || alert.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && alerts.length === 0 && (
          <div className="text-center py-40 bg-white/[0.01] border border-dashed border-white/10 rounded-3xl animate-safemed-fadein">
            <div className="w-24 h-24 mx-auto mb-8 bg-brand-blue/5 border border-brand-blue/10 rounded-full flex items-center justify-center relative">
              <Eye className="w-10 h-10 text-brand-blue opacity-30" />
              <div className="absolute inset-0 rounded-full border-2 border-brand-blue/10 border-t-brand-blue/40 animate-spin-slow" />
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Clinical Harmony Achieved</h3>
            <p className="text-surface-500 text-sm mt-3 max-w-md mx-auto">No active safety threats or anomalous signals detected across clinical compound clusters.</p>
            <button
              onClick={generateAlerts}
              className="mt-10 btn-premium px-10 py-4 group"
            >
              <RefreshCcw className="w-4 h-4 mr-3 group-hover:rotate-180 transition-transform duration-500" />
              <span className="uppercase tracking-[0.2em] text-xs font-bold">Initiate Deep System Re-Scan</span>
            </button>
          </div>
        )}
      </div>
    </Layout>
  )
}
