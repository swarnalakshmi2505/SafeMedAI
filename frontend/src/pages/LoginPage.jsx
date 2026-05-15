import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLocation, useNavigate } from 'react-router-dom'
import { Shield, Lock, Mail, Loader2, ShieldCheck, Activity } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(location.state?.message || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const data = await login(form.email, form.password)
      setSuccess('Authentication Protocol Verified.')
      setTimeout(() => {
        navigate(data.role === 'officer' ? '/officer/dashboard' : '/doctor/dashboard')
      }, 700)
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please verify credentials.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center relative overflow-hidden font-sans">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[80%] bg-brand-blue/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[80%] bg-brand-cyan/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150" />
      </div>

      <div className="relative w-full max-w-md px-6 animate-safemed-fadein">
        
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-blue/10 border border-brand-blue/20 rounded-3xl shadow-glow-blue/10 mb-6 group hover:scale-110 transition-transform duration-500">
            <Shield className="w-10 h-10 text-brand-blue" />
          </div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tighter mb-2">SafeMed<span className="text-brand-cyan">AI</span></h1>
          <p className="text-[11px] text-enterprise-muted font-bold uppercase tracking-[0.3em]">Enterprise Intelligence Portal</p>
        </div>

        <div className="premium-card !p-8 backdrop-blur-xl bg-white/[0.03] border-white/10 shadow-2xl relative overflow-hidden">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-enterprise-muted uppercase tracking-[0.2em] ml-1">Personnel Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-enterprise-muted group-focus-within:text-brand-cyan transition-colors" />
                <input 
                  type="email" required placeholder="name@safemedai.com"
                  value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-12 py-3.5 text-sm font-medium text-white placeholder-enterprise-muted focus:outline-none focus:border-brand-blue/30 focus:bg-white/[0.05] transition-all" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-enterprise-muted uppercase tracking-[0.2em] ml-1">Security Token</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-enterprise-muted group-focus-within:text-brand-cyan transition-colors" />
                <input 
                  type="password" required placeholder="••••••••"
                  value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-12 py-3.5 text-sm font-medium text-white placeholder-enterprise-muted focus:outline-none focus:border-brand-blue/30 focus:bg-white/[0.05] transition-all" 
                />
              </div>
            </div>

            {success && (
              <div className="bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald text-[11px] font-bold px-4 py-3 rounded-xl flex items-center gap-3 animate-safemed-slidein">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                {success}
              </div>
            )}
            
            {error && (
              <div className="bg-brand-red/10 border border-brand-red/30 text-brand-red text-[11px] font-bold px-4 py-3 rounded-xl flex items-center gap-3 animate-safemed-slidein">
                <Activity className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="btn-premium w-full py-4 flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-4 h-4" />}
              <span className="uppercase tracking-[0.2em] text-xs font-bold">
                {loading ? 'Verifying Node...' : 'Establish Connection'}
              </span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-enterprise-muted font-medium">
              Awaiting credentials? <span className="text-brand-cyan cursor-pointer font-bold hover:underline" onClick={() => navigate('/register')}>Register Secure Access</span>
            </p>
          </div>
        </div>

        {/* Footer Security Note */}
        <p className="text-center mt-10 text-[9px] text-enterprise-muted font-bold uppercase tracking-[0.1em] max-w-xs mx-auto opacity-40">
          This system is restricted to authorized personnel. All connections are monitored and logged.
        </p>
      </div>
    </div>
  )
}
