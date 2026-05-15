import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts'
import { 
  Bot, 
  Zap, 
  ArrowLeft, 
  Pill, 
  FileText, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  ShieldAlert,
  ChevronRight,
  Database,
  Search,
  FlaskConical,
  Dna,
  History,
  Info,
  Download,
  Shield
} from 'lucide-react'
import Layout from '../components/Layout'
import api, { downloadsAPI, analyticsAPI } from '../services/api'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import toast from 'react-hot-toast'

const signalBadge = (sig, confirmed) => {
  if (!confirmed) return 'text-surface-500 bg-white/5 border-white/10'
  if (sig === 'strong')   return 'text-brand-red bg-brand-red/10 border-brand-red/20 shadow-glow-red/5'
  if (sig === 'moderate') return 'text-brand-amber bg-brand-amber/10 border-brand-amber/20'
  return                         'text-brand-blue bg-brand-blue/10 border-brand-blue/20'
}

function Section({ title, icon: Icon, children, className = "", subtitle = "" }) {
  return (
    <div className={`clinical-card ${className}`}>
      <div className="flex items-center justify-between mb-8 border-b border-white/[0.05] pb-4">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-brand-blue/10 border border-brand-blue/20 rounded-lg text-brand-blue shadow-glow-blue/10">
            {Icon && <Icon className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">
              {title}
            </h3>
            {subtitle && <p className="text-[10px] text-surface-500 font-bold uppercase tracking-widest mt-1">{subtitle}</p>}
          </div>
        </div>
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
        setError(err.response?.data?.detail || 'Clinical data node synchronization failure.')
      })
      .finally(() => setLoading(false))
  }, [drugName])

  const generatePDF = async (mode = 'save') => {
    if (!drug) return;

    try {
      const toastId = toast.loading(`${mode === 'save' ? 'Downloading' : 'Opening'} Clinical Intelligence Report...`);
      
      let rank = 'N/A';
      try {
        const lbRes = await analyticsAPI.getLeaderboard();
        const foundIndex = lbRes.data.findIndex(d => d.drug_name.toLowerCase() === drug.drug_name.toLowerCase());
        if (foundIndex !== -1) rank = foundIndex + 1;
      } catch (lbErr) {
        console.warn("Leaderboard fetch failed, rank will be N/A", lbErr);
      }

      const doc = new jsPDF();
      const timestamp = new Date().toLocaleString();

      // Header
      doc.setFillColor(11, 18, 32);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text("SafeMedAI Clinical Report", 15, 25);
      doc.setFontSize(10);
      doc.text(`Generated: ${timestamp}`, 140, 25);

      // Drug Name and Score
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(26);
      doc.text(drug.drug_name.toUpperCase(), 15, 55);
      
      doc.setFontSize(14);
      doc.text(`Leadership Rank: #${rank}`, 15, 65);
      doc.text(`Global Risk Score: ${drug.risk_score}/100 (${drug.risk_level.toUpperCase()})`, 15, 75);

      // Section: Core Metrics
      doc.setFontSize(16);
      doc.text("Safety Surveillance Metrics", 15, 90);
      doc.line(15, 92, 195, 92);

      const metricsData = [
        ["Metric", "Value", "Clinical Significance"],
        ["Total Reports", drug.total_reports || '0', "Global FAERS volume"],
        ["Strongest ROR", `${drug.strongest_ror || '0'}x`, "Signal disproportionality intensity"],
        ["Death Rate", `${drug.death_rate || '0'}%`, "Fatal outcome frequency"],
        ["Serious Rate", `${drug.serious_rate || '0'}%`, "Serious adverse event momentum"],
        ["Signal Count", drug.signal_count || '0', "Validated safety signal clusters"]
      ];

      autoTable(doc, {
        startY: 95,
        head: [metricsData[0]],
        body: metricsData.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] }
      });

      const finalY1 = (doc).lastAutoTable?.finalY || 150;

      // Section: ROR Signals
      doc.setFontSize(16);
      doc.text("Top ADR Signal Analysis (ROR)", 15, finalY1 + 15);
      
      const rorData = (drug.ror_signals || []).map(s => [
        s.reaction,
        s.ror,
        `${s.ci_lower} - ${s.ci_upper}`,
        (s.signal || 'low').toUpperCase(),
        s.confirmed ? "VALIDATED" : "PROVISIONAL"
      ]);

      if (rorData.length > 0) {
        autoTable(doc, {
          startY: finalY1 + 20,
          head: [["Reaction", "ROR", "95% CI", "Signal Intensity", "Status"]],
          body: rorData,
          theme: 'grid'
        });
      } else {
        doc.setFontSize(10);
        doc.text("No specific ADR signals detected in current dataset.", 15, finalY1 + 25);
        doc.lastAutoTable = { finalY: finalY1 + 30 };
      }

      const finalY2 = (doc).lastAutoTable?.finalY || 200;

      // Section: Clinical Context
      doc.setFontSize(16);
      doc.text("Clinical Protocol & Hazards", 15, finalY2 + 15);
      doc.setFontSize(10);
      
      const splitUses = doc.splitTextToSize(`Indications: ${drug.uses || 'N/A'}`, 180);
      doc.text(splitUses, 15, finalY2 + 25);
      
      const nextY = finalY2 + 25 + (splitUses.length * 5);
      const splitAvoid = doc.splitTextToSize(`Contraindications: ${drug.who_should_avoid || 'N/A'}`, 180);
      doc.text(splitAvoid, 15, nextY);

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`SafeMedAI Intelligence Node | Confidential Pharmacovigilance Audit | Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
      }

      if (mode === 'save') {
        doc.save(`SafeMedAI_Report_${drug.drug_name}_${new Date().getTime()}.pdf`);
        try {
          await downloadsAPI.recordDownload(drug.drug_name);
        } catch (recErr) {
          console.error("Failed to record download history:", recErr);
        }
      } else {
        window.open(doc.output('bloburl'), '_blank');
      }
      
      toast.dismiss(toastId);
      toast.success(mode === 'save' ? 'Report Downloaded & Archived' : 'Report Opened');
    } catch (err) {
      console.error("PDF Generation Error:", err);
      toast.error('Clinical intelligence node failure during PDF synthesis.');
    }
  };

  const handleDownloadReport = () => generatePDF('save');

  if (loading) return (
    <Layout title="Clinical Intelligence">
      <div className="flex flex-col items-center justify-center h-[70vh] gap-6">
        <div className="w-16 h-16 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin shadow-glow-blue/20"></div>
        <div className="text-center">
          <p className="text-[11px] font-black text-brand-blue uppercase tracking-[0.3em] animate-pulse">Initializing Neural Data Nodes</p>
          <p className="text-[9px] text-surface-500 uppercase tracking-widest mt-2">Syncing with Global Surveillance Matrix</p>
        </div>
      </div>
    </Layout>
  )

  if (error || !drug) return (
    <Layout title="System Breach">
      <div className="max-w-2xl mx-auto mt-20 animate-safemed-slidein">
        <button onClick={() => navigate(-1)}
          className="text-surface-500 hover:text-white font-bold text-[10px] uppercase tracking-widest mb-8 flex items-center gap-3 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Intelligence Feed
        </button>
        <div className="clinical-card !p-12 text-center border-brand-red/30 bg-brand-red/5">
          <div className="w-20 h-20 bg-brand-red/10 border border-brand-red/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShieldAlert className="w-10 h-10 text-brand-red" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Signal Retrieval Failure</h2>
          <p className="text-surface-500 text-sm font-medium mb-10 max-w-md mx-auto leading-relaxed">{error || 'Data node unreachable or unauthorized access'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-premium px-10 py-4"
          >
            Re-Initialize Protocol
          </button>
        </div>
      </div>
    </Layout>
  )

  return (
    <Layout title={`${drug.drug_name} Intelligence Matrix`}>
      <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-safemed-fadein">

        {/* Global Navigation */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <button onClick={() => navigate(-1)}
            className="text-surface-500 hover:text-white font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 transition-all group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Return to Signal Feed
          </button>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate(`/officer/report/${drug.drug_name}`)}
              className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Full Analytics</span>
            </button>
            <button
              onClick={handleDownloadReport}
              className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={() => navigate('/officer/chatbot', { state: { drugContext: drug.drug_name } })}
              className="px-6 py-3 rounded-xl bg-brand-blue text-white font-bold text-[10px] uppercase tracking-widest shadow-glow-blue hover:scale-105 transition-all flex items-center gap-2"
            >
              <Bot className="w-4 h-4" />
              <span>Consult AI</span>
            </button>
          </div>
        </div>

        {/* Hero Clinical Console */}
        <div className="clinical-card border-l-4 border-brand-blue relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
            <FlaskConical className="w-64 h-64 text-brand-blue" />
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-start gap-12 relative z-10">
            <div className="flex-1">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-16 h-16 bg-brand-blue/10 border border-brand-blue/20 rounded-2xl flex items-center justify-center text-4xl shadow-glow-blue/10">
                  <Pill className="w-8 h-8 text-brand-blue" />
                </div>
                <div>
                  <h1 className="text-5xl font-black text-white capitalize tracking-tighter leading-none">
                    {drug.drug_name}
                  </h1>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse shadow-glow-cyan" />
                      <span className="text-[10px] font-bold text-surface-500 uppercase tracking-[0.2em]">Node Active</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-white/10" />
                    <span className="text-[10px] font-mono text-surface-600 uppercase tracking-tighter">STRAT-PV-{drug.id?.toString().slice(-6) || 'N/A'}</span>
                  </div>
                </div>
              </div>
              <p className="text-white/70 text-lg font-medium leading-relaxed max-w-3xl italic">
                "{drug.explanation}"
              </p>
            </div>

            {/* Risk Visualization Matrix */}
            <div className="flex-shrink-0 flex flex-col items-center bg-brand-navy/60 p-8 rounded-3xl border border-white/10 shadow-premium">
              <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-4 border-white/5 bg-white/[0.02]">
                <span className={`text-4xl font-black ${
                  drug.risk_level === 'critical' ? 'text-brand-red' : drug.risk_level === 'high' ? 'text-brand-amber' : 'text-brand-blue'
                }`}>{drug.risk_score}</span>
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle 
                    cx="50" cy="50" r="46" fill="none" 
                    stroke="rgba(255,255,255,0.05)" strokeWidth="6" 
                  />
                  <circle 
                    cx="50" cy="50" r="46" fill="none" 
                    stroke={drug.risk_level === 'critical' ? '#EF4444' : drug.risk_level === 'high' ? '#F59E0B' : '#2563EB'} strokeWidth="6" 
                    strokeDasharray="289" strokeDashoffset={289 - (289 * drug.risk_score / 100)}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
              </div>
              <div className="mt-6 text-center">
                <p className="text-[10px] font-bold text-surface-500 uppercase tracking-[0.2em] mb-2">
                  Unified Risk Vector
                </p>
                <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${
                  drug.risk_level === 'critical' ? 'bg-brand-red/10 border-brand-red/30 text-brand-red' : 
                  drug.risk_level === 'high' ? 'bg-brand-amber/10 border-brand-amber/30 text-brand-amber' : 
                  'bg-brand-blue/10 border-brand-blue/30 text-brand-blue'
                }`}>
                  {drug.risk_level} Priority
                </div>
              </div>
            </div>
          </div>

          {/* Core Analytics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-12 border-t border-white/[0.05]">
            {[
              { label: 'Signal Intensity', value: `${drug.strongest_ror}x`, color: 'text-brand-blue', icon: Activity },
              { label: 'Critical Variance', value: `${drug.death_rate}%`, color: 'text-brand-red', icon: ShieldAlert },
              { label: 'Serious Momentum', value: `${drug.serious_rate}%`, color: 'text-brand-amber', icon: AlertTriangle },
              { label: 'Validated Nodes', value: drug.signal_count, color: 'text-brand-cyan', icon: Database },
            ].map(m => (
              <div key={m.label} className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 group hover:bg-white/[0.04] transition-all">
                <div className="flex items-center justify-between mb-3">
                  <m.icon className={`w-5 h-5 ${m.color} opacity-60`} />
                  <span className={`text-2xl font-black ${m.color}`}>{m.value}</span>
                </div>
                <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest">{m.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical Data Ecosystem */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Intelligence Columns */}
          <div className="lg:col-span-2 space-y-10">
            
            <Section title="Therapeutic Protocol" icon={Pill} subtitle="Approved Clinical Indications">
              <p className="text-white/80 text-base font-medium leading-relaxed">
                {drug.uses}
              </p>
            </Section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <Section title="Efficacy Vectors" icon={CheckCircle} subtitle="Therapeutic Assets">
                <p className="text-white/80 text-sm font-medium leading-relaxed">
                  {drug.pros}
                </p>
              </Section>
              <Section title="Signal Hazards" icon={AlertTriangle} subtitle="Detected ADR Clusters">
                <p className="text-white/80 text-sm font-medium leading-relaxed">
                  {drug.cons}
                </p>
              </Section>
            </div>

            {/* Disproportionality Matrix */}
            <Section title="Signal Variance Matrix" icon={Activity} subtitle="Disproportionality analysis via ROR logic">
              <div className="overflow-x-auto mt-6">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.05]">
                      <th className="pb-6 text-[10px] font-black text-surface-500 uppercase tracking-widest">Reaction Node</th>
                      <th className="pb-6 text-[10px] font-black text-surface-500 uppercase tracking-widest">ROR Vector</th>
                      <th className="pb-6 text-[10px] font-black text-surface-500 uppercase tracking-widest text-center">Protocol Intensity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {drug.ror_signals?.map((sig, i) => (
                      <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="py-6 text-sm font-bold text-white capitalize">{sig.reaction}</td>
                        <td className="py-6">
                          <span className="font-bold text-brand-blue text-xl tracking-tighter">{sig.ror}</span>
                        </td>
                        <td className="py-6 text-center">
                          <span className={`text-[9px] font-black px-4 py-1.5 rounded-lg border uppercase tracking-widest transition-all ${signalBadge(sig.signal, sig.confirmed)}`}>
                            {sig.signal} {sig.confirmed ? 'Validated' : 'Provisional'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            {/* Surveillance Trends */}
            {drug.yearly_trends?.length > 0 && (
              <Section title="Temporal Surveillance Matrix" icon={History} subtitle="Report momentum and severity trends">
                <div className="h-[350px] mt-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={drug.yearly_trends}>
                      <defs>
                        <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorSerious" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis 
                        dataKey="year" 
                        stroke="#475569" 
                        fontSize={10} 
                        fontWeight={700}
                        axisLine={false}
                        tickLine={false}
                        dy={15}
                      />
                      <YAxis 
                        stroke="#475569" 
                        fontSize={10} 
                        fontWeight={700}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0B1220', 
                          border: '1px solid rgba(255,255,255,0.1)', 
                          borderRadius: '12px',
                          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
                          padding: '16px'
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="report_count" 
                        stroke="#2563EB" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorReports)" 
                        name="Global Reports"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="serious_count" 
                        stroke="#EF4444" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorSerious)" 
                        name="Serious Adverse Events"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Section>
            )}
          </div>

          {/* Contextual Intelligence Column */}
          <div className="space-y-10">
            
            <Section title="Risk Protocol" icon={ShieldAlert} subtitle="Patient Safety Warnings">
              <div className="bg-brand-red/10 border border-brand-red/30 p-6 rounded-2xl relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                  <ShieldAlert className="w-12 h-12 text-brand-red" />
                </div>
                <p className="text-white text-xs font-bold leading-relaxed italic relative z-10">
                  {drug.who_should_avoid}
                </p>
              </div>
            </Section>

            {/* Evidence Intelligence */}
            <Section title="Evidence Nodes" icon={FileText} subtitle="Linked Repository Status">
              <div className="space-y-4 mt-6">
                {[
                  { label: 'FDA Label Matrix', status: drug.evidence?.fda_label ? 'Synchronized' : 'Null', active: !!drug.evidence?.fda_label, icon: Search },
                  { label: 'PubMed Archive', value: `${drug.evidence?.pubmed_count || 0} Artifacts`, active: true, icon: Dna },
                  { label: 'Global FAERS Node', value: `${drug.evidence?.faers_reports?.toLocaleString() || 0} Reports`, active: true, icon: Database },
                ].map(ev => (
                  <div key={ev.label} className="bg-white/[0.02] border border-white/[0.05] p-4 rounded-xl flex justify-between items-center group hover:bg-white/[0.04] transition-all">
                    <div className="flex items-center gap-3">
                      <ev.icon className="w-4 h-4 text-surface-500 group-hover:text-brand-blue transition-colors" />
                      <span className="text-[10px] font-bold text-surface-500 uppercase tracking-widest">{ev.label}</span>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-tighter ${ev.active ? 'text-brand-cyan' : 'text-surface-500'}`}>
                      {ev.status || ev.value}
                    </span>
                  </div>
                ))}
              </div>
            </Section>

            {/* Safer Alternative Matrix */}
            {drug.alternatives?.length > 0 && (
              <Section title="Safety Substitutions" icon={Shield} subtitle="Low-ROR Comparative Clusters">
                <div className="space-y-4 mt-6">
                  {drug.alternatives.map((alt) => (
                    <div
                      key={alt.drug_name}
                      onClick={() => navigate(`/officer/drug/${alt.drug_name}`)}
                      className="clinical-card !p-5 hover:bg-white/[0.02] cursor-pointer transition-all group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-black text-white capitalize group-hover:text-brand-cyan transition-colors">{alt.drug_name}</span>
                        <div className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest bg-brand-blue/10 border border-brand-blue/30 text-brand-blue`}>
                          {alt.risk_level} Risk
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-surface-500">
                        <span className="font-mono">Index: {alt.risk_score}%</span>
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
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
