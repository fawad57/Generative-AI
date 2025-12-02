// src/pages/SignupPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/authpages/SignUp.css';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/signup', { name, email, password, phone });
      alert('Signup successful! Please login.');
      navigate('/login');
    } catch (error) {
      alert(error.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h1 className="signup-title">Create Account 🚀</h1>
        <p className="signup-subtitle">Join PsyPlex AI to start your journey</p>
        <form onSubmit={handleSubmit} className="signup-form">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="signup-input"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="signup-input"
            required
          />
          <input
            type="tel"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="signup-input"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="signup-input"
            required
          />
          <label className="signup-checkbox">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              required
            />
            I agree to the Terms & Conditions
          </label>
          <button type="submit" className="signup-button" disabled={loading}>
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>
        <div className="signup-divider">
          <span>Or sign up with</span>
        </div>
        <div className="social-buttons">
          <button className="social-button">
            <FcGoogle className="social-icon" />
            Google
          </button>
          <button className="social-button">
            <FaFacebook className="social-icon facebook-icon" />
            Facebook
          </button>
        </div>
        <p className="signup-footer">
          Already have an account? <a href="/login" className="signup-link">Login</a>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;