import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OfficerDashboard from './pages/OfficerDashboard';
import DrugSearchPage from './pages/DrugSearchPage';
import DrugDetailPage from './pages/DrugDetailPage';
import AlertsPage from './pages/AlertsPage';
import InteractionPage from './pages/InteractionPage';
import PersonalizedPage from './pages/PersonalizedPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ChatbotPage from './pages/ChatbotPage';
import ReportsPage from './pages/ReportsPage';
import ReportPreviewPage from './pages/ReportPreviewPage';
import SentimentPage from './pages/SentimentPage';
import ProfilePage from './pages/ProfilePage';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import SubmitReportPage from './pages/doctor/SubmitReportPage';
import MyReportsPage from './pages/doctor/MyReportsPage';
import DoctorDrugSearch from './pages/doctor/DoctorDrugSearch';
import DoctorChatbot from './pages/doctor/DoctorChatbot';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/officer/*" element={
            <ProtectedRoute allowedRole="officer">
              <Routes>
                <Route path="dashboard" element={<OfficerDashboard />} />
                <Route path="leaderboard" element={<LeaderboardPage />} />
                <Route path="search" element={<DrugSearchPage />} />
                <Route path="drug/:drugName" element={<DrugDetailPage />} />
                <Route path="alerts" element={<AlertsPage />} />
                <Route path="interaction" element={<InteractionPage />} />
                <Route path="personalized" element={<PersonalizedPage />} />
                <Route path="sentiment" element={<SentimentPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="report/:drugName" element={<ReportPreviewPage />} />
                <Route path="chatbot" element={<ChatbotPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </ProtectedRoute>
          } />

          <Route path="/doctor/*" element={
            <ProtectedRoute allowedRole="doctor">
              <Routes>
                <Route path="dashboard" element={<DoctorDashboard />} />
                <Route path="submit" element={<SubmitReportPage />} />
                <Route path="my-reports" element={<MyReportsPage />} />
                <Route path="drugs" element={<DoctorDrugSearch />} />
                <Route path="chatbot" element={<DoctorChatbot />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
