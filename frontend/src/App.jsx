import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import LoginPage from './pages/LoginPage';
import OfficerDashboard from './pages/OfficerDashboard';
import DrugSearchPage from './pages/DrugSearchPage';
import DrugDetailPage from './pages/DrugDetailPage';
import AlertsPage from './pages/AlertsPage';
import InteractionPage from './pages/InteractionPage';
import PersonalizedPage from './pages/PersonalizedPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ChatbotPage from './pages/ChatbotPage';
import ReportsPage from './pages/ReportsPage';
import SentimentPage from './pages/SentimentPage';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<LoginPage />} />
          
          {/* Officer Routes */}
          <Route path="/officer/dashboard" element={<ProtectedRoute allowedRole="officer"><OfficerDashboard /></ProtectedRoute>} />
          <Route path="/officer/leaderboard" element={<ProtectedRoute allowedRole="officer"><LeaderboardPage /></ProtectedRoute>} />
          <Route path="/officer/search" element={<ProtectedRoute allowedRole="officer"><DrugSearchPage /></ProtectedRoute>} />
          <Route path="/officer/drug/:drugName" element={<ProtectedRoute allowedRole="officer"><DrugDetailPage /></ProtectedRoute>} />
          <Route path="/officer/alerts" element={<ProtectedRoute allowedRole="officer"><AlertsPage /></ProtectedRoute>} />
          <Route path="/officer/interaction" element={<ProtectedRoute allowedRole="officer"><InteractionPage /></ProtectedRoute>} />
          <Route path="/officer/personalized" element={<ProtectedRoute allowedRole="officer"><PersonalizedPage /></ProtectedRoute>} />
          <Route path="/officer/sentiment" element={<ProtectedRoute allowedRole="officer"><SentimentPage /></ProtectedRoute>} />
          <Route path="/officer/reports" element={<ProtectedRoute allowedRole="officer"><ReportsPage /></ProtectedRoute>} />
          <Route path="/officer/chatbot" element={<ProtectedRoute allowedRole="officer"><ChatbotPage /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
