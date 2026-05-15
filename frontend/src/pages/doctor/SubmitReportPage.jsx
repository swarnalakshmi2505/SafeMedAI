import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Search,
  CheckCircle,
  Info,
  FileCheck,
  ShieldAlert
} from 'lucide-react';
import { doctorAPI, dataAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';

export default function SubmitReportPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefillDrug = location.state?.prefillDrug || '';

  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [drugs, setDrugs] = useState([]);
  const [drugSearch, setDrugSearch] = useState(prefillDrug);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    drug_name: prefillDrug,
    patient_age: '',
    patient_gender: '',
    patient_weight: '',
    pre_existing_conditions: '',
    dosage: '',
    duration_of_use: '',
    onset_date: '',
    symptoms: '',
    severity: 'mild',
    patient_recovered: 'recovered',
    clinical_evidence: '',
    alternative_causes: '',
    causality: 'probable',
    recommendation: 'Discontinue drug'
  });

  useEffect(() => {
    async function fetchDrugs() {
      try {
        const res = await dataAPI.getStats();
        setDrugs(res.data || []);
      } catch (err) {
        console.error("Failed to fetch drugs:", err);
      }
    }
    fetchDrugs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.drug_name || !formData.symptoms) {
      toast.error("Please fill in the required fields");
      return;
    }

    try {
      setLoading(true);
      await doctorAPI.submitReport(formData);
      toast.success("Clinical report submitted successfully");
      navigate('/doctor/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Submit Adverse Event">
      <div className="max-w-4xl mx-auto animate-safemed-fadein">
        {/* Progress Header */}
        <div className="premium-card mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-teal-500 -translate-y-1/2 z-0 transition-all duration-500" 
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />

            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="relative z-10 flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                  step > i ? 'bg-teal-500 border-teal-500 text-white' :
                  step === i ? 'bg-slate-900 border-teal-500 text-teal-500 shadow-glow-teal' :
                  'bg-slate-900 border-slate-700 text-slate-500'
                }`}>
                  {step > i ? <Check className="w-5 h-5" /> : i}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest mt-2 ${
                  step >= i ? 'text-teal-400' : 'text-slate-500'
                }`}>
                  {i === 1 ? 'Patient' : i === 2 ? 'Clinical' : i === 3 ? 'Analysis' : 'Verify'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="premium-card min-h-[500px] flex flex-col">
          {step === 1 && (
            <div className="flex-1 animate-in slide-in-from-right-4 duration-500">
              <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Info className="w-5 h-5 text-teal-400" />
                Patient Demographics
              </h2>
              <p className="text-sm text-slate-400 mb-8">Basic anonymous patient information for signal clustering.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Patient Age</label>
                  <input 
                    type="number"
                    value={formData.patient_age}
                    onChange={(e) => setFormData({...formData, patient_age: e.target.value})}
                    placeholder="Years"
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Gender</label>
                  <select 
                    value={formData.patient_gender}
                    onChange={(e) => setFormData({...formData, patient_gender: e.target.value})}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-teal-500 transition-colors"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other/Non-binary</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Weight (Approx kg)</label>
                  <input 
                    type="number"
                    value={formData.patient_weight}
                    onChange={(e) => setFormData({...formData, patient_weight: e.target.value})}
                    placeholder="e.g. 70"
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Relevant Pre-existing Conditions</label>
                  <textarea 
                    value={formData.pre_existing_conditions}
                    onChange={(e) => setFormData({...formData, pre_existing_conditions: e.target.value})}
                    placeholder="Asthma, Diabetes, Hypertension, etc."
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-teal-500 transition-colors min-h-[100px]"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex-1 animate-in slide-in-from-right-4 duration-500">
              <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-teal-400" />
                Drug & Reaction Details
              </h2>
              <p className="text-sm text-slate-400 mb-8">Identify the suspected drug and the observed reaction.</p>
              
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Suspected Medication</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="text"
                      value={drugSearch}
                      onChange={(e) => setDrugSearch(e.target.value)}
                      placeholder="Search medication name..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-teal-500 transition-colors"
                    />
                    {drugSearch && !formData.drug_name && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden z-50 shadow-2xl">
                        {drugs.filter(d => d.drug_name.toLowerCase().includes(drugSearch.toLowerCase())).slice(0, 5).map(drug => (
                          <button
                            key={drug.drug_name}
                            onClick={() => {
                              setFormData({...formData, drug_name: drug.drug_name});
                              setDrugSearch(drug.drug_name);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-teal-500/10 text-slate-300 text-sm border-b border-slate-800 last:border-0"
                          >
                            <span className="font-bold text-white">{drug.drug_name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dosage Schedule</label>
                    <input 
                      type="text"
                      value={formData.dosage}
                      onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                      placeholder="e.g. 500mg BID"
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Duration of Use</label>
                    <input 
                      type="text"
                      value={formData.duration_of_use}
                      onChange={(e) => setFormData({...formData, duration_of_use: e.target.value})}
                      placeholder="e.g. 3 weeks, 4 months"
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Symptoms & Clinical Presentation</label>
                    <textarea 
                      value={formData.symptoms}
                      onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                      placeholder="Describe the adverse event in detail..."
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-teal-500 transition-colors min-h-[120px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Severity Level</label>
                    <select 
                      value={formData.severity}
                      onChange={(e) => setFormData({...formData, severity: e.target.value})}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-teal-500 transition-colors"
                    >
                      <option value="mild">Mild</option>
                      <option value="moderate">Moderate</option>
                      <option value="severe">Severe</option>
                      <option value="life-threatening">Life-threatening</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date of Onset</label>
                    <input 
                      type="date"
                      value={formData.onset_date}
                      onChange={(e) => setFormData({...formData, onset_date: e.target.value})}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex-1 animate-in slide-in-from-right-4 duration-500">
              <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-teal-400" />
                Causality & Evidence
              </h2>
              <p className="text-sm text-slate-400 mb-8">Provide your clinical assessment of the event.</p>
              
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Patient Outcome</label>
                    <select 
                      value={formData.patient_recovered}
                      onChange={(e) => setFormData({...formData, patient_recovered: e.target.value})}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-teal-500 transition-colors"
                    >
                      <option value="recovered">Recovered / Resolved</option>
                      <option value="recovering">Recovering / Resolving</option>
                      <option value="not-recovered">Not Recovered</option>
                      <option value="permanent-damage">Permanent Sequelae</option>
                      <option value="fatal">Fatal</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Causality Assessment (WHO-UMC)</label>
                    <select 
                      value={formData.causality}
                      onChange={(e) => setFormData({...formData, causality: e.target.value})}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-teal-500 transition-colors"
                    >
                      <option value="certain">Certain</option>
                      <option value="probable">Probable / Likely</option>
                      <option value="possible">Possible</option>
                      <option value="unlikely">Unlikely</option>
                      <option value="unclassified">Conditional / Unclassified</option>
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Clinical Evidence (Labs, Tests)</label>
                    <textarea 
                      value={formData.clinical_evidence}
                      onChange={(e) => setFormData({...formData, clinical_evidence: e.target.value})}
                      placeholder="e.g. Elevated ALT/AST, Abnormal ECG, Biopsy results..."
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-teal-500 transition-colors min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Alternative Causes Considered</label>
                    <textarea 
                      value={formData.alternative_causes}
                      onChange={(e) => setFormData({...formData, alternative_causes: e.target.value})}
                      placeholder="Underlying disease, other medications, etc."
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-teal-500 transition-colors min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Management & Recommendations</label>
                    <textarea 
                      value={formData.recommendation}
                      onChange={(e) => setFormData({...formData, recommendation: e.target.value})}
                      placeholder="e.g. Drug discontinued, Patient hospitalized, Dose reduced..."
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-teal-500 transition-colors min-h-[100px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex-1 animate-in zoom-in-95 duration-500 flex flex-col items-center justify-center text-center py-10">
              <div className="w-20 h-20 bg-teal-500/10 border border-teal-500/30 rounded-full flex items-center justify-center mb-6 shadow-glow-teal/20">
                <CheckCircle className="w-10 h-10 text-teal-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Review & Attest</h2>
              <p className="text-slate-400 mb-8 max-w-md">Please verify all clinical information. Once submitted, the report will be analyzed by our AI engine and queued for officer review.</p>
              
              <div className="w-full bg-slate-900/30 border border-slate-800 rounded-2xl p-6 text-left mb-8 space-y-4">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-500 uppercase font-bold">Suspected Drug</span>
                  <span className="text-sm text-white font-bold">{formData.drug_name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-500 uppercase font-bold">Patient</span>
                  <span className="text-sm text-white font-bold">{formData.patient_age}y, {formData.patient_gender}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-500 uppercase font-bold">Severity</span>
                  <span className={`text-xs font-bold uppercase tracking-widest ${
                    formData.severity === 'life-threatening' ? 'text-red-400' :
                    formData.severity === 'severe' ? 'text-orange-400' :
                    'text-teal-400'
                  }`}>{formData.severity}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-10">
                <input 
                  type="checkbox" 
                  id="attest"
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-teal-500 focus:ring-teal-500"
                />
                <label htmlFor="attest" className="text-xs text-slate-400">
                  I attest that this information is accurate to the best of my clinical knowledge.
                </label>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="mt-12 pt-8 border-t border-slate-800 flex items-center justify-between">
            {step > 1 ? (
              <button 
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 text-slate-400 hover:text-white font-bold text-sm transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Previous Step
              </button>
            ) : <div />}

            <div className="flex gap-4">
              <button 
                onClick={() => navigate('/doctor/dashboard')}
                className="px-6 py-3 rounded-xl border border-slate-800 text-slate-400 font-bold text-sm hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              
              {step < 4 ? (
                <button 
                  onClick={() => setStep(step + 1)}
                  className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-teal-900/20 transition-all"
                >
                  Next Step <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-10 py-3 rounded-xl font-bold text-sm shadow-lg shadow-teal-900/20 transition-all disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Finalize & Submit'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
