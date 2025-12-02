import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/authpages/ResetPasswordPage.css';

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || 'No email provided';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword === confirmPassword && newPassword.length >= 6) {
      setLoading(true);
      try {
        await api.post('/auth/reset-password', { email, password: newPassword });
        alert('Password reset successful! Please login.');
        navigate('/login'); // Redirect to login after successful reset
      } catch (error) {
        alert(error.response?.data || 'Password reset failed');
      } finally {
        setLoading(false);
      }
    } else {
      alert('Passwords do not match or are too short (minimum 6 characters).');
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h1 className="reset-password-title">Reset Password 🔒</h1>
        <p className="reset-password-subtitle">Create a new password for your account</p>
        <form onSubmit={handleSubmit} className="reset-password-form">
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="reset-password-input"
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="reset-password-input"
            required
          />
          <button type="submit" className="reset-password-button" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        <p className="reset-password-footer">
          <a href="/login" className="reset-password-link">Back to Login</a>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;