import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "../../styles/authpages/Login.css";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { browsingHistoryAPI } from "../../services/api.js";
import { browsingModelAPI } from "../../services/api.js";
import { addEmotionAPI } from "../../services/api.js";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFetchHistory = async () => {
    setLoading(true);
    try {
      const response = await browsingHistoryAPI.fetchHistory();
      console.log("Fetched history:", response.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchModelData = async () => {
    setLoading(true);
    try {
      const response = await browsingModelAPI.getModelData();
      console.log("Fetched model data:", response.data);
    } catch (error) {
      console.error("Error fetching model data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmotion = async () => {
    setLoading(true);
    try {
      const response = await addEmotionAPI.addEmotion();
      console.log("Added emotion data:", response.data);
    } catch (error) {
      console.error("Error adding emotion data:", error);
    } finally {
      setLoading(false);
    } 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      const { accessToken, refreshToken, user } = response.data;
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
      await handleFetchHistory();
      await handleFetchModelData();
      await handleAddEmotion();
      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Welcome Back 👋</h1>
        <p className="login-subtitle">Login to continue with PsyPlex AI</p>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
            required
          />
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
            required
          />
          <div className="login-options">
            <label className="login-checkbox">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            <a href="/forgot-password" className="login-forgot">
              Forgot Password?
            </a>
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="login-divider">
          <span>Or continue with</span>
        </div>
        <div className="social-buttons">
          <button className="social-button">
            <FcGoogle className="social-icon" />
          </button>
          <button className="social-button">
            <FaFacebook className="social-icon facebook-icon" />
          </button>
        </div>
        <p className="login-footer">
          Don’t have an account?{" "}
          <a href="/signup" className="login-link">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
