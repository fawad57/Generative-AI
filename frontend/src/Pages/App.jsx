// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./authpages/Login";
import SignupPage from "./authpages/SignUp";
import ForgotPasswordPage from "./authpages/ForgotPasswordPage";
import OTPVerificationPage from "./authpages/OTPVerificationPage";
import ResetPasswordPage from "./authpages/ResetPasswordPage";
import MoodTrackingDashboard from "./MoodTracking/MoodTrackingDashboard";
import ProfilePage from "./profile/ProfilePage";
import ChatbotPage from "./chatbot/ChatbotPage";
import ProtectedRoute from "../components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp" element={<OTPVerificationPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><MoodTrackingDashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/chatbot" element={<ProtectedRoute><ChatbotPage /></ProtectedRoute>} />
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;