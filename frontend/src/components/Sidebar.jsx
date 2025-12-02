import '../styles/components/Sidebar.css';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Settings,
  User,
  Heart,
  Brain,
  Activity,
  MessageCircle
} from 'lucide-react';

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2 className="sidebar-title">PsyPlex AI</h2>
      </div>
      <div className="sidebar-content">
        <div className="sidebar-group">
          <div className="sidebar-group-content">
            <ul className="sidebar-menu">
              <li className={`sidebar-menu-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                <Link to="/dashboard" className="sidebar-menu-button">
                  <Home className="sidebar-icon" />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li className="sidebar-menu-item">
                <div className="sidebar-menu-button">
                  <Heart className="sidebar-icon" />
                  <span>Mood Tracker</span>
                </div>
              </li>
              <li className="sidebar-menu-item">
                <div className="sidebar-menu-button">
                  <Brain className="sidebar-icon" />
                  <span>Insights</span>
                </div>
              </li>
              <li className="sidebar-menu-item">
                <div className="sidebar-menu-button">
                  <Activity className="sidebar-icon" />
                  <span>Analytics</span>
                </div>
              </li>
              <li className={`sidebar-menu-item ${location.pathname === '/chatbot' ? 'active' : ''}`}>
                <Link to="/chatbot" className="sidebar-menu-button">
                  <MessageCircle className="sidebar-icon" />
                  <span>Chatbot</span>
                </Link>
              </li>              
              <li className={`sidebar-menu-item ${location.pathname === '/profile' ? 'active' : ''}`}>
                <Link to="/profile" className="sidebar-menu-button">
                  <User className="sidebar-icon" />
                  <span>Profile</span>
                </Link>
              </li>
              <li className="sidebar-menu-item">
                <div className="sidebar-menu-button">
                  <Settings className="sidebar-icon" />
                  <span>Settings</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
