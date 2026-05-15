import { useEffect, useState } from 'react'
import { Bell, ShieldAlert, CheckCircle, RefreshCcw } from 'lucide-react'
import Layout from '../components/Layout'
import api from '../services/api'
import AlertBanner from '../components/AlertBanner'

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

  return (
    <Layout title="Alert Command Center">
      <div className="max-w-5xl mx-auto space-y-8 animate-safemed-fadein">

        {/* Header Area */}
        <div className="flex items-center justify-between bg-white border border-medical-100 rounded-2xl p-6 shadow-soft">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center shadow-soft">
              <ShieldAlert className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">Security Monitoring</h1>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">
                {unreviewed.length} Priority Review{unreviewed.length !== 1 ? 's' : ''} Pending
              </p>
            </div>
          </div>
          <button
            onClick={generateAlerts}
            disabled={generating}
            className="bg-medical-500 hover:bg-medical-600 text-white px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-lg shadow-medical-500/20 active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            {generating ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
            {generating ? 'Scanning Systems...' : 'Manual Signal Scan'}
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <RefreshCcw className="w-8 h-8 text-medical-200 animate-spin" />
          </div>
        )}

        {/* Unreviewed Signals */}
        {unreviewed.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
              Critical Surveillance Needed
            </h2>
            <div className="space-y-3">
              {unreviewed.map(alert => (
                <div
                  key={alert.id}
                  className="bg-white border border-medical-100 rounded-2xl p-5 flex items-start justify-between gap-6 hover:border-medical-300 transition-colors group animate-safemed-slidein"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-soft
                      ${alert.level === 'critical' ? 'bg-red-50' : alert.level === 'high' ? 'bg-orange-50' : 'bg-yellow-50'}`}>
                      {alert.level === 'critical' ? '🔴' : alert.level === 'high' ? '🟠' : '🟡'}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-base font-black text-slate-900 capitalize leading-none group-hover:text-medical-600 transition-colors">
                          {alert.drug_name}
                        </span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider
                          ${alert.level === 'critical' ? 'bg-red-500 text-white' : alert.level === 'high' ? 'bg-orange-500 text-white' : 'bg-yellow-500 text-white'}`}>
                          {alert.level}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                          Signal Intensity: {alert.risk_score}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[13px] font-medium leading-relaxed">{alert.message}</p>
                      <p className="text-slate-400 text-[10px] font-bold mt-2 uppercase tracking-tighter">
                        Timestamp: {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => markReviewed(alert.id)}
                    className="flex-shrink-0 text-[11px] font-bold bg-slate-50 hover:bg-green-50 hover:text-green-600 text-slate-500 px-4 py-2 rounded-xl border border-slate-100 hover:border-green-200 transition-all active:scale-95"
                  >
                    Clear Signal
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviewed History */}
        {reviewed.length > 0 && (
          <div className="space-y-4 pt-4 opacity-70">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
              Cleared History
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {reviewed.map(alert => (
                <div
                  key={alert.id}
                  className="bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-3"
                >
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-slate-700 capitalize block truncate">
                      {alert.drug_name}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                      {alert.level} · Reviewed at {new Date(alert.updated_at || alert.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && alerts.length === 0 && (
          <div className="text-center py-32 bg-white border border-dashed border-medical-200 rounded-3xl animate-safemed-fadein">
            <div className="text-5xl mb-4 animate-safemed-float">🧘</div>
            <h3 className="text-lg font-black text-slate-900">Systems Harmonized</h3>
            <p className="text-slate-500 text-sm mt-2 font-medium">No active safety threats detected across clinical compounds.</p>
            <button
              onClick={generateAlerts}
              className="mt-6 text-medical-600 font-bold text-xs hover:underline"
            >
              Run system-wide re-scan →
            </button>
          </div>
        )}
      </div>
    </Layout>
  )
}
