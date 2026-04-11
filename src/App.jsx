import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, AppContext } from './context/AppContext';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Exam from './components/Exam';
import History from './components/History';
import AdminDashboard from './components/AdminDashboard';
import Leaderboard from './components/Leaderboard';
import About from './components/About';
import PrivacyPolicy from './components/PrivacyPolicy';
import Help from './components/Help';
import Feedback from './components/Feedback';
import Register from './components/Register';
import StudentProfile from './components/StudentProfile';
import EmailConfirmation from './components/EmailConfirmation';
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AppContext);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role !== 'student') return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <AppProvider>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: 'var(--card-bg)',
            color: 'var(--text-light)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px'
          }
        }} 
      />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/check-email" element={<EmailConfirmation />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/help" element={<Help />} />
          <Route path="/feedback" element={<Feedback />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/exam/:id" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Exam />
            </ProtectedRoute>
          } />
          
          <Route path="/history" element={
              <ProtectedRoute allowedRoles={['student']}>
                <History />
              </ProtectedRoute>
            } 
          />
          <Route path="/profile" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/leaderboard" 
            element={
              <ProtectedRoute allowedRoles={['student', 'admin', 'guru', 'tu']}>
                <Leaderboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin', 'guru', 'TU', 'pengawas']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
