import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerUser } from '../services/api'
import { Shield, User, Mail, Lock, Briefcase, Award, Loader2, ArrowLeft } from 'lucide-react'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'officer', license_number: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await registerUser(form)
      navigate('/', {
        replace: true,
        state: { message: 'Node Access Granted. Please establish connection.' },
      })
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Database node error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center relative overflow-hidden font-sans">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[80%] bg-brand-blue/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[80%] bg-brand-cyan/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-lg px-6 animate-safemed-fadein py-12">
        
        {/* Navigation Back */}
        <button 
          onClick={() => navigate('/')}
          className="absolute -top-12 left-6 text-enterprise-muted hover:text-white font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 transition-all group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Portal
        </button>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-display font-bold text-white tracking-tighter mb-2">Initialize <span className="text-brand-blue">Personnel</span> Profile</h2>
          <p className="text-[10px] text-enterprise-muted font-bold uppercase tracking-[0.3em]">Register for Enterprise Surveillance Access</p>
        </div>

        <div className="premium-card !p-10 backdrop-blur-xl bg-white/[0.03] border-white/10 shadow-2xl relative overflow-hidden">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-enterprise-muted uppercase tracking-[0.2em] ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-enterprise-muted group-focus-within:text-brand-cyan transition-colors" />
                  <input 
                    required placeholder="Dr. Sarah Connor"
                    value={form.full_name} onChange={e => setForm(p => ({...p, full_name: e.target.value}))}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-12 py-3 text-sm font-medium text-white placeholder-enterprise-muted focus:outline-none focus:border-brand-blue/30 focus:bg-white/[0.05] transition-all" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-enterprise-muted uppercase tracking-[0.2em] ml-1">Personnel Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-enterprise-muted group-focus-within:text-brand-cyan transition-colors" />
                  <input 
                    required type="email" placeholder="name@safemedai.com"
                    value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-12 py-3 text-sm font-medium text-white placeholder-enterprise-muted focus:outline-none focus:border-brand-blue/30 focus:bg-white/[0.05] transition-all" 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-enterprise-muted uppercase tracking-[0.2em] ml-1">Security Token</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-enterprise-muted group-focus-within:text-brand-cyan transition-colors" />
                  <input 
                    required type="password" placeholder="••••••••"
                    value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-12 py-3 text-sm font-medium text-white placeholder-enterprise-muted focus:outline-none focus:border-brand-blue/30 focus:bg-white/[0.05] transition-all" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-enterprise-muted uppercase tracking-[0.2em] ml-1">Personnel Role</label>
                <div className="relative group">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-enterprise-muted group-focus-within:text-brand-cyan transition-colors" />
                  <select 
                    value={form.role} onChange={e => setForm(p => ({...p, role: e.target.value}))}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-12 py-3 text-sm font-medium text-white focus:outline-none focus:border-brand-blue/30 focus:bg-[#1a2035] transition-all appearance-none"
                  >
                    <option value="officer" className="bg-brand-navy">PV Officer</option>
                    <option value="doctor" className="bg-brand-navy">Medical Doctor</option>
                  </select>
                </div>
              </div>
            </div>

            {form.role === 'doctor' && (
              <div className="space-y-2 animate-safemed-slidein">
                <label className="text-[10px] font-black text-enterprise-muted uppercase tracking-[0.2em] ml-1">Medical License Identity</label>
                <div className="relative group">
                  <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-enterprise-muted group-focus-within:text-brand-cyan transition-colors" />
                  <input 
                    placeholder="ML-9920-X82"
                    value={form.license_number} onChange={e => setForm(p => ({...p, license_number: e.target.value}))}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-12 py-3 text-sm font-medium text-white placeholder-enterprise-muted focus:outline-none focus:border-brand-blue/30 focus:bg-white/[0.05] transition-all" 
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="bg-brand-red/10 border border-brand-red/30 text-brand-red text-[11px] font-bold px-4 py-3 rounded-xl animate-safemed-slidein">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="btn-premium w-full py-4 flex items-center justify-center gap-3 active:scale-[0.98] mt-4"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-4 h-4" />}
              <span className="uppercase tracking-[0.2em] text-xs font-bold">
                {loading ? 'Processing Node...' : 'Initialize Profile'}
              </span>
            </button>
          </form>
        </div>

        {/* Footer Security Note */}
        <p className="text-center mt-10 text-[9px] text-enterprise-muted font-bold uppercase tracking-[0.1em] max-w-xs mx-auto opacity-40">
          Encryption Level: AES-256 GCM. Your data is protected by SafeMedAI neural defense.
        </p>
      </div>
    </div>
  )
}
