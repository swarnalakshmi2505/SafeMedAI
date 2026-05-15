import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const analyticsAPI = {
  getLeaderboard: () => api.get('/analytics/leaderboard'),
  getRiskProfile: (drugName) => api.get(`/analytics/risk-profile/${encodeURIComponent(drugName)}`),
  getDrugDetail: (drugName) => api.get(`/analytics/drug-detail/${encodeURIComponent(drugName)}`),
  getDemographics: (drugName) => api.get(`/analytics/demographics?drug_name=${encodeURIComponent(drugName)}`),
  getTrendAlerts: () => api.get('/analytics/trend-alerts'),
  recalculateAll: () => api.post('/analytics/recalculate-all'),
};

export const dataAPI = {
  getDrugs: () => api.get('/data/drugs'),
  getSummary: () => api.get('/data/summary'),
  getTrends: (drugName) => api.get(`/data/trends/${encodeURIComponent(drugName)}`),
  triggerIngest: (limit = 50) => api.post(`/data/ingest?limit=${limit}`),
  getIngestStatus: () => api.get('/data/ingest/status'),
  getLeaderboard: () => analyticsAPI.getLeaderboard(),
};

export const doctorAPI = {
  submitReport: (payload) => api.post('/doctor-reports/', payload),
  getMyReports: () => api.get('/doctor-reports/me'),
  getReportById: (id) => api.get(`/doctor-reports/${id}`),
};

export const alertsAPI = {
  getAlerts: () => api.get('/alerts/'),
  generateAlerts: () => api.post('/alerts/generate'),
  validateAlert: (id) => api.patch(`/alerts/${id}/validate`),
  sendAlert: (id) => api.patch(`/alerts/${id}/send`),
};

export const authAPI = {
  login: (payload) => api.post('/auth/login', payload),
  register: (payload) => api.post('/auth/register', payload),
  getMe: () => api.get('/auth/me'),
  getUnverifiedDoctors: () => api.get('/auth/unverified-doctors'),
  verifyDoctor: (id) => api.patch(`/auth/verify-doctor/${id}`),
};

export const getHealth = () => api.get('/health');
export const registerUser = (payload) => authAPI.register(payload);
export const loginUser = (payload) => authAPI.login(payload);
export const getCurrentUser = () => authAPI.getMe();
export const triggerIngestion = (limit = 50) => dataAPI.triggerIngest(limit);
export const getIngestionStatus = () => dataAPI.getIngestStatus();
export const getTrackedDrugs = () => dataAPI.getDrugs();
export const getDrugDetail = (drugName) => analyticsAPI.getDrugDetail(drugName);
export const getRiskProfile = (drugName) => analyticsAPI.getRiskProfile(drugName);
export const advancedAPI = {
  getInteraction:      (drugA, drugB) =>
    api.get(`/advanced/interaction?drug_a=${drugA}&drug_b=${drugB}`),
  getPersonalized:     (drug, age, gender) =>
    api.get(`/advanced/personalized?drug_name=${drug}&age=${age}&gender=${gender}`),
  chat:                (message, history, drugContext) =>
    api.post('/advanced/chat', {
      message,
      history,
      drug_context: drugContext || null
    }),
};

export const downloadsAPI = {
  recordDownload: (drugName, reportType = "PDF Clinical Analysis") => 
    api.post('/downloads/record', { drug_name: drugName, report_type: reportType }),
  getHistory: () => api.get('/downloads/history'),
};

export const getTrendAlerts = () => analyticsAPI.getTrendAlerts();

export const doctorAPI = {
  submitReport:    (data)       => api.post('/doctor-reports/submit', data),
  getMyReports:    ()           => api.get('/doctor-reports/my-reports'),
  getReport:       (id)         => api.get(`/doctor-reports/${id}`),
  analyzeReport:   (id)         => api.post(`/doctor-reports/${id}/analyze`),
  getAllReports:    (status)     => api.get(`/doctor-reports/${status ? '?status='+status : ''}`),
  reviewReport:    (id)         => api.patch(`/doctor-reports/${id}/review`),
};

export default api;
