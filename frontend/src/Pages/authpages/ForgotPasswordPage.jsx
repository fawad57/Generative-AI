import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/authpages/ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      // Navigate to OTP verification page with email in state
      navigate('/verify-otp', { state: { email } });
    } catch (error) {
      alert(error.response?.data || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h1 className="forgot-password-title">Forgot Password 🔑</h1>
        <p className="forgot-password-subtitle">Enter your email address to reset your password</p>
        <form onSubmit={handleSubmit} className="forgot-password-form">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="forgot-password-input"
            required
          />
          <button type="submit" className="forgot-password-button" disabled={loading}>
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
        <p className="forgot-password-footer">
          <a href="/login" className="forgot-password-link">Back to Login</a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;