import React from 'react';
import { FileText, Download, Filter, Calendar } from 'lucide-react';
import Layout from '../components/Layout';

export default function ReportsPage() {
  const reports = [
    { id: 'RP-2026-001', name: 'Quarterly Safety Signal Summary', date: '2026-05-10', type: 'Clinical', status: 'Ready' },
    { id: 'RP-2026-002', name: 'Warfarin Disproportionality Analysis', date: '2026-05-08', type: 'PV Signal', status: 'Processing' },
    { id: 'RP-2026-003', name: 'Demographic Risk Variance - Q2', date: '2026-05-05', type: 'Demographic', status: 'Ready' },
    { id: 'RP-2026-004', name: 'FDA FAERS Ingestion Log', date: '2026-05-01', type: 'System', status: 'Ready' },
  ];

  return (
    <Layout title="Clinical Reports Archive">
      <div className="max-w-6xl mx-auto space-y-8 animate-safemed-fadein">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-medical-100 shadow-soft">
          <div>
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Pharmacovigilance Reports</h1>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Generated clinical intelligence and system logs</p>
          </div>
          <button className="bg-medical-500 hover:bg-medical-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-medical-500/20 active:scale-95 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Generate New Report
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-3">
            <Filter className="w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Filter reports by name or ID..." className="bg-transparent border-none focus:outline-none text-sm w-full font-medium" />
          </div>
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-3">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-600">Last 30 Days</span>
          </div>
        </div>

        {/* Reports Table */}
        <div className="safemed-card overflow-hidden !p-0">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Report ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Name</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Generation Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-medical-50/30 transition-colors group">
                  <td className="px-6 py-4 text-xs font-bold text-medical-600">{report.id}</td>
                  <td className="px-6 py-4 text-sm font-extrabold text-slate-900">{report.name}</td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-500">{report.date}</td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md uppercase">
                      {report.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${
                      report.status === 'Ready' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600 animate-pulse'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-medical-600 transition-colors p-2 rounded-lg hover:bg-medical-50">
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </Layout>
  );
}
