import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Eye, 
  Search, 
  Filter, 
  User,
  Activity,
  AlertCircle,
  BrainCircuit,
  X,
  CheckCircle
} from 'lucide-react';
import { doctorAPI } from '../../services/api';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';

export default function MyReportsPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await doctorAPI.getMyReports();
      setReports(res.data || []);
    } catch (error) {
      console.error("Fetch reports error:", error);
      toast.error("Failed to load your reports");
    } finally {
      setLoading(false);
    }
  };

  const openReport = async (reportId) => {
    try {
      const res = await doctorAPI.getReport(reportId);
      setSelectedReport(res.data);
      setShowModal(true);
    } catch (error) {
      toast.error("Failed to load report details");
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'life-threatening': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'severe': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'moderate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'mild': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'reviewed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'actioned': return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const filteredReports = reports.filter(r => 
    r.drug_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.report_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout title="Clinical Intelligence">
      <div className="space-y-8 animate-safemed-fadein">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">My Clinical Reports</h1>
            <p className="text-slate-400 text-sm">Track and manage your submitted adverse event reports.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:border-teal-500 outline-none transition-all w-64"
              />
            </div>
            <button className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 bg-black/20">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Report ID</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Drug</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Severity</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Causality</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
                        <span className="text-slate-500 text-sm">Loading reports...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredReports.length > 0 ? (
                  filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-teal-400 font-bold">{report.report_id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-white">{report.drug_name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${getSeverityColor(report.severity)}`}>
                          {report.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-300 capitalize">{report.causality}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-500 font-medium">{new Date(report.created_at).toLocaleDateString()}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => openReport(report.report_id)}
                          className="p-2 hover:bg-teal-500/10 text-slate-400 hover:text-teal-400 rounded-lg transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-20 text-center">
                      <div className="max-w-xs mx-auto">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FileText className="w-8 h-8 text-slate-600" />
                        </div>
                        <h3 className="text-white font-bold mb-1">No reports found</h3>
                        <p className="text-slate-500 text-sm mb-6">You haven't submitted any reports matching your search.</p>
                        <button 
                          onClick={() => navigate('/doctor/submit')}
                          className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all"
                        >
                          Submit Your First Report
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Report Detail Modal */}
        {showModal && selectedReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            
            <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-safemed-fadein">
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-teal-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-white">Report Details</h2>
                      <span className="font-mono text-sm text-teal-400 font-bold px-2 py-0.5 bg-teal-500/10 border border-teal-500/20 rounded">
                        {selectedReport.report_id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">
                      Submitted on {new Date(selectedReport.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  {/* Patient Summary */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider">
                      <User className="w-4 h-4" /> Patient Info
                    </div>
                    <div className="bg-black/20 rounded-2xl p-4 border border-slate-800/50 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-500 font-medium">ID:</span>
                        <span className="text-sm text-slate-300 font-mono">{selectedReport.patient_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-500 font-medium">Age/Gender:</span>
                        <span className="text-sm text-slate-300">{selectedReport.patient_age}y / {selectedReport.patient_gender}</span>
                      </div>
                      {selectedReport.patient_weight && (
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-500 font-medium">Weight:</span>
                          <span className="text-sm text-slate-300">{selectedReport.patient_weight} kg</span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-slate-800">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Pre-existing Conditions</span>
                        <p className="text-xs text-slate-400 leading-relaxed italic">
                          {selectedReport.pre_existing_conditions || 'None reported'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Drug Summary */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                      <Activity className="w-4 h-4" /> Drug Administration
                    </div>
                    <div className="bg-black/20 rounded-2xl p-4 border border-slate-800/50 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-500 font-medium">Drug:</span>
                        <span className="text-sm text-emerald-400 font-bold">{selectedReport.drug_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-500 font-medium">Dosage:</span>
                        <span className="text-sm text-slate-300">{selectedReport.dosage || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-500 font-medium">Duration:</span>
                        <span className="text-sm text-slate-300">{selectedReport.duration_of_use || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-500 font-medium">Onset:</span>
                        <span className="text-sm text-slate-300">{selectedReport.onset_date || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Summary */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
                      <AlertCircle className="w-4 h-4" /> Report Status
                    </div>
                    <div className="bg-black/20 rounded-2xl p-4 border border-slate-800/50 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-500 font-medium">Status:</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${getStatusColor(selectedReport.status)}`}>
                          {selectedReport.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-500 font-medium">Severity:</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${getSeverityColor(selectedReport.severity)}`}>
                          {selectedReport.severity}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-500 font-medium">Causality:</span>
                        <span className="text-xs text-slate-300 font-bold capitalize">{selectedReport.causality}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content Sections */}
                <div className="space-y-8">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <div className="w-1 h-4 bg-teal-500 rounded-full" />
                      Reaction & Symptoms
                    </h4>
                    <div className="bg-slate-800/30 rounded-2xl p-5 border border-slate-800">
                      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {selectedReport.symptoms}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                        Clinical Evidence
                      </h4>
                      <div className="bg-slate-800/30 rounded-2xl p-5 border border-slate-800 min-h-[100px]">
                        <p className="text-sm text-slate-400 leading-relaxed italic">
                          {selectedReport.clinical_evidence || 'No clinical evidence provided.'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <div className="w-1 h-4 bg-amber-500 rounded-full" />
                        Alternative Causes
                      </h4>
                      <div className="bg-slate-800/30 rounded-2xl p-5 border border-slate-800 min-h-[100px]">
                        <p className="text-sm text-slate-400 leading-relaxed italic">
                          {selectedReport.alternative_causes || 'No alternative causes considered.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <div className="w-1 h-4 bg-blue-500 rounded-full" />
                      Doctor's Recommendation
                    </h4>
                    <div className="bg-blue-500/10 rounded-2xl p-5 border border-blue-500/20">
                      <p className="text-sm text-blue-300 font-bold flex items-center gap-3">
                        <CheckCircle className="w-5 h-5" />
                        {selectedReport.recommendation}
                      </p>
                    </div>
                  </div>

                  {/* AI Analysis Block */}
                  <div className="animate-in slide-in-from-bottom duration-1000">
                    <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <BrainCircuit className="w-5 h-5 text-purple-400" />
                      SafeMed AI Intelligence
                    </h4>
                    <div className="bg-purple-900/10 border border-purple-500/20 rounded-2xl p-6 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl -z-10 group-hover:bg-purple-500/10 transition-colors" />
                      
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-purple-400">Automated Validation Result</span>
                      </div>

                      {selectedReport.ai_analysis ? (
                        <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                          {selectedReport.ai_analysis}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center py-6">
                          <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-400 rounded-full animate-spin mb-3" />
                          <p className="text-xs text-purple-400 font-medium text-center">AI is currently analyzing this report for signal strength...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-800 flex justify-end bg-black/20">
                <button 
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-all"
                >
                  Close View
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
