import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/authpages/OTPVerificationPage.css';

const OTPVerificationPage = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const inputRefs = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || 'No email provided';

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData('text').slice(0, 6).replace(/\D/g, '');
    if (pasteData.length === 6) {
      setOtp(pasteData.split(''));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length === 6) {
      setLoading(true);
      try {
        await api.post('/auth/verify-otp', { email, code: fullOtp });
        // Navigate to reset password page with email in state
        navigate('/reset-password', { state: { email } });
      } catch (error) {
        alert(error.response?.data || 'OTP verification failed');
      } finally {
        setLoading(false);
      }
    } else {
      alert('Please enter a valid 6-digit OTP.');
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      alert('OTP resent successfully');
    } catch (error) {
      alert(error.response?.data || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  useEffect(() => {
    inputRefs.current[0].focus();
  }, []);

  return (
    <div className="otp-container">
      <div className="otp-card">
        <h1 className="otp-title">Verify OTP 📲</h1>
        <p className="otp-subtitle">Enter the 6-digit code sent to {email}</p>
        <form onSubmit={handleSubmit} className="otp-form">
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                ref={(el) => (inputRefs.current[index] = el)}
                className="otp-input"
                required
              />
            ))}
          </div>
          <button type="submit" className="otp-button" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify'}
          </button>
          <a href="#" className="otp-resend" onClick={(e) => { e.preventDefault(); handleResendOtp(); }} disabled={resendLoading}>
            {resendLoading ? 'Resending...' : 'Resend OTP'}
          </a>
        </form>
        <p className="otp-footer">
          <a href="/login" className="otp-link">Back to Login</a>
        </p>
      </div>
    </div>
  );
};

export default OTPVerificationPage;