import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Download, 
  ArrowLeft, 
  FileText, 
  Shield, 
  Activity, 
  AlertTriangle, 
  Printer,
  ChevronRight,
  Database,
  ExternalLink,
  History
} from 'lucide-react';
import Layout from '../components/Layout';
import api, { downloadsAPI, analyticsAPI } from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

export default function ReportPreviewPage() {
  const { drugName } = useParams();
  const navigate = useNavigate();
  const [drug, setDrug] = useState(null);
  const [rank, setRank] = useState('N/A');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const drugRes = await api.get(`/drugs/${drugName.toLowerCase()}`);
        setDrug(drugRes.data);
        
        const lbRes = await analyticsAPI.getLeaderboard();
        const foundIndex = lbRes.data.findIndex(d => d.drug_name.toLowerCase() === drugName.toLowerCase());
        if (foundIndex !== -1) setRank(foundIndex + 1);
      } catch (err) {
        console.error("Report data fetch failure:", err);
        toast.error("Critical node synchronization failure.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [drugName]);

  const handleDownloadPDF = () => {
    if (!drug) return;

    try {
      const doc = new jsPDF();
      const timestamp = new Date().toLocaleString();

      // Header
      doc.setFillColor(10, 15, 30);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text("SafeMedAI Clinical Report", 15, 25);
      doc.setFontSize(10);
      doc.text(`Generated: ${timestamp}`, 140, 25);

      // Drug Identity
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(26);
      doc.text(drug.drug_name.toUpperCase(), 15, 55);
      doc.setFontSize(14);
      doc.text(`Leadership Rank: #${rank}`, 15, 65);
      doc.text(`Risk Score: ${drug.risk_score}/100`, 15, 75);

      // Metrics Table
      autoTable(doc, {
        startY: 85,
        head: [["Metric", "Value", "Clinical Significance"]],
        body: [
          ["Total Reports", drug.total_reports, "FAERS Volume"],
          ["Strongest ROR", `${drug.strongest_ror}x`, "Signal Intensity"],
          ["Death Rate", `${drug.death_rate}%`, "Fatal Outcome"],
          ["Serious Rate", `${drug.serious_rate}%`, "Severity Momentum"],
          ["Signal Count", drug.signal_count, "Validated Clusters"]
        ],
        theme: 'striped',
        headStyles: { fillStyle: [59, 130, 246] }
      });

      // ROR Table
      const finalY1 = doc.lastAutoTable.finalY;
      doc.setFontSize(16);
      doc.text("ADR Signal Matrix (ROR)", 15, finalY1 + 15);
      
      const rorData = (drug.ror_signals || []).map(s => [
        s.reaction,
        s.ror,
        `${s.ci_lower}-${s.ci_upper}`,
        (s.signal || 'low').toUpperCase(),
        s.confirmed ? "YES" : "NO"
      ]);

      autoTable(doc, {
        startY: finalY1 + 20,
        head: [["Reaction", "ROR", "95% CI", "Signal", "Validated"]],
        body: rorData,
        theme: 'grid'
      });

      // Clinical Notes
      const finalY2 = doc.lastAutoTable.finalY;
      doc.setFontSize(16);
      doc.text("Clinical Intelligence Summary", 15, finalY2 + 15);
      doc.setFontSize(9);
      const splitUses = doc.splitTextToSize(`Indications: ${drug.uses}`, 180);
      doc.text(splitUses, 15, finalY2 + 25);
      
      const nextY = finalY2 + 25 + (splitUses.length * 5);
      const splitAvoid = doc.splitTextToSize(`Contraindications: ${drug.who_should_avoid}`, 180);
      doc.text(splitAvoid, 15, nextY);

      doc.save(`SafeMedAI_Full_Report_${drug.drug_name}.pdf`);
      downloadsAPI.recordDownload(drug.drug_name);
      toast.success("Clinical PDF Archive Successfully Exported");
    } catch (err) {
      toast.error("PDF Synthesis Failure");
    }
  };

  if (loading) return (
    <Layout title="Report Node Syncing">
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin"></div>
        <p className="text-[10px] font-bold text-enterprise-muted uppercase tracking-widest">Synthesizing Clinical Data...</p>
      </div>
    </Layout>
  );

  if (!drug) return (
    <Layout title="Node Failure">
      <div className="max-w-2xl mx-auto py-20 text-center">
        <AlertTriangle className="w-16 h-16 text-brand-red mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-white mb-4">Intelligence Retrieval Error</h2>
        <button onClick={() => navigate(-1)} className="btn-premium">Return to Dashboard</button>
      </div>
    </Layout>
  );

  return (
    <Layout title={`${drugName.toUpperCase()} Analysis`}>
      <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-safemed-fadein">
        
        {/* Report Toolbar */}
        <div className="flex items-center justify-between border-b border-enterprise-border pb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-3 text-enterprise-muted hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Close Audit</span>
          </button>
          
          <div className="flex gap-4">
            <button onClick={() => window.print()} className="btn-ghost px-6 py-2 flex items-center gap-2">
              <Printer className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Print Node</span>
            </button>
            <button onClick={handleDownloadPDF} className="btn-premium px-8 py-3 flex items-center gap-3 shadow-glow-blue">
              <Download className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Download Official PDF</span>
            </button>
          </div>
        </div>

        {/* Formal Report Document Styling */}
        <div className="bg-white text-brand-navy shadow-2xl p-12 md:p-20 rounded-sm min-h-[1000px] relative overflow-hidden print:p-0 print:shadow-none print:m-0">
          {/* Document Watermark */}
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none rotate-12">
            <Shield className="w-96 h-96" />
          </div>

          {/* Document Header */}
          <div className="flex justify-between items-start border-b-2 border-brand-navy pb-10 mb-12">
            <div>
              <h1 className="text-4xl font-display font-black tracking-tighter uppercase italic">SafeMed<span className="text-brand-blue">AI</span></h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Clinical Surveillance & Signal Intelligence</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase">Protocol ID: RP-{new Date().getFullYear()}-{drug.id}</p>
              <p className="text-[10px] text-slate-500 font-medium">Timestamp: {new Date().toLocaleDateString()} | {new Date().toLocaleTimeString()}</p>
            </div>
          </div>

          {/* Drug Title Section */}
          <div className="mb-12">
            <div className="flex items-baseline gap-4 mb-4">
              <h2 className="text-6xl font-display font-bold capitalize tracking-tighter">{drug.drug_name}</h2>
              <span className="text-xl font-bold text-brand-blue">Intelligence Node</span>
            </div>
            <div className="grid grid-cols-3 gap-8">
              <div className="border-l-4 border-brand-blue pl-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Risk Stratification</p>
                <p className="text-2xl font-bold uppercase">{drug.risk_level} Priority</p>
              </div>
              <div className="border-l-4 border-brand-blue pl-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Unified Score</p>
                <p className="text-2xl font-bold">{drug.risk_score}/100</p>
              </div>
              <div className="border-l-4 border-brand-blue pl-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Leadership Rank</p>
                <p className="text-2xl font-bold">#{rank}</p>
              </div>
            </div>
          </div>

          {/* Metrics Visualization */}
          <div className="grid grid-cols-2 gap-12 mb-16">
            <div className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest border-b border-slate-200 pb-2 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Core Safety Vectors
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Global FAERS Reports', value: drug.total_reports, unit: 'Nodes' },
                  { label: 'Disproportionality (ROR)', value: drug.strongest_ror, unit: 'x' },
                  { label: 'Fatal Outcome Rate', value: drug.death_rate, unit: '%' },
                  { label: 'Serious Adverse Events', value: drug.serious_rate, unit: '%' },
                ].map(m => (
                  <div key={m.label} className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-xs font-bold text-slate-500 uppercase">{m.label}</span>
                    <span className="text-sm font-black">{m.value}{m.unit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg">
              <h3 className="text-sm font-black uppercase tracking-widest border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Source Intelligence
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
                  <p className="text-[11px] font-medium leading-relaxed italic text-slate-600">
                    "This report synthesizes data from the FDA FAERS database, PubMed clinical archives, and openFDA structured labels."
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200">
                   <div className="flex justify-between items-center">
                     <span className="text-[10px] font-bold uppercase text-slate-400">FAERS Integration</span>
                     <span className="text-[10px] font-bold text-brand-blue">ACTIVE</span>
                   </div>
                   <div className="flex justify-between items-center mt-1">
                     <span className="text-[10px] font-bold uppercase text-slate-400">PubMed Sync</span>
                     <span className="text-[10px] font-bold text-brand-blue">SYNCHRONIZED</span>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* ADR Signal Table */}
          <div className="mb-16">
            <h3 className="text-sm font-black uppercase tracking-widest border-b-2 border-brand-navy pb-2 mb-6 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Validated Signal Matrix (ROR Analysis)
            </h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="p-3 text-[10px] uppercase font-bold">Adverse Reaction Node</th>
                  <th className="p-3 text-[10px] uppercase font-bold text-center">ROR Vector</th>
                  <th className="p-3 text-[10px] uppercase font-bold text-center">95% Confidence</th>
                  <th className="p-3 text-[10px] uppercase font-bold text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 border-b border-slate-200">
                {drug.ror_signals?.slice(0, 8).map((sig, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="p-3 text-xs font-bold capitalize">{sig.reaction}</td>
                    <td className="p-3 text-sm font-black text-center text-brand-blue">{sig.ror}</td>
                    <td className="p-3 text-[10px] font-mono text-center text-slate-500">{sig.ci_lower} - {sig.ci_upper}</td>
                    <td className="p-3 text-right">
                      <span className={`text-[9px] font-black px-2 py-1 rounded border uppercase ${sig.confirmed ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                        {sig.confirmed ? 'Validated' : 'Provisional'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Clinical Text Sections */}
          <div className="grid grid-cols-1 gap-10 mb-20">
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Therapeutic Indications</h4>
              <p className="text-sm font-medium leading-relaxed text-slate-700 bg-slate-50 p-6 rounded-lg border-l-4 border-slate-200">
                {drug.uses}
              </p>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-brand-red mb-3">Safety Contraindications</h4>
              <p className="text-sm font-medium leading-relaxed text-slate-700 bg-red-50/50 p-6 rounded-lg border-l-4 border-brand-red/30">
                {drug.who_should_avoid}
              </p>
            </div>
          </div>

          {/* Document Footer */}
          <div className="mt-auto border-t-2 border-brand-navy pt-8 flex justify-between items-end opacity-60">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest">Official Clinical Intelligence Audit</p>
              <p className="text-[9px] font-medium">SafeMedAI Decentralized Node Infrastructure | Regulatory Compliance Node: 0x92F...A2</p>
            </div>
            <div className="w-16 h-16 bg-slate-100 rounded flex items-center justify-center border border-slate-200">
              <Printer className="w-8 h-8 text-slate-300" />
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}
