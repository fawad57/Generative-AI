import { useState, useEffect } from 'react';
import { FaCamera, FaEdit, FaSignOutAlt, FaSave, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { profileAPI } from '../../services/api';
import '../../styles/profile/ProfilePage.css';

const ProfilePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await profileAPI.getProfile();
      setProfile(response.data);
      setEditForm(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleEditProfile = () => {
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditForm(profile);
    setEditing(false);
    setSelectedFile(null);
  };

  const handleSaveProfile = async () => {
    try {
      const formData = new FormData();
      Object.keys(editForm).forEach(key => {
        if (key !== 'profilePicture') {
          formData.append(key, editForm[key]);
        }
      });
      if (selectedFile) {
        formData.append('profilePicture', selectedFile);
      }
      const response = await profileAPI.updateProfile(formData);
      setProfile(response.data.user);
      setEditing(false);
      setSelectedFile(null);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditForm(prev => ({
          ...prev,
          profilePicture: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      navigate('/login');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="profile-container">
        <Sidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />
        <div className="profile-main-content">
          <div className="loading">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Sidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />
      <div className="profile-main-content">
        <h1 className="profile-header">My Profile 👤</h1>
        <div className="profile-top-section">
          <div className="avatar-container">
            <div className="avatar">
              <img src= "https://img.freepik.com/free-photo/fashionable-young-guy-dressed-t-shirt-denim-jacket-posing-studio-isolated-dark-background_613910-5822.jpg?semt=ais_hybrid&w=740&q=80" />
              {editing && (
                <div className="file-input-container">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input"
                    id="profile-picture"
                  />
                  <label htmlFor="profile-picture" className="upload-photo-btn">
                    <FaCamera />
                  </label>
                  {selectedFile && (
                    <div className="file-selected">
                      <span>✓ {selectedFile.name}</span>
                    </div>
                  )}
                </div>
              )}
              {!editing && (
                <button className="edit-avatar-btn" onClick={handleEditProfile}>
                  <FaCamera />
                </button>
              )}
            </div>
          </div>
          <div className="user-info">
            {editing ? (
              <input
                type="text"
                value={editForm.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="edit-input"
                placeholder="Full Name"
              />
            ) : (
              <h2>{profile?.name || 'Name not set'}</h2>
            )}
            <p>{profile?.email}</p>
            {editing ? (
              <div className="edit-actions">
                <button className="save-btn" onClick={handleSaveProfile}>
                  <FaSave /> Save
                </button>
                <button className="cancel-btn" onClick={handleCancelEdit}>
                  <FaTimes /> Cancel
                </button>
              </div>
            ) : (
              <button className="edit-profile-btn" onClick={handleEditProfile}>
                <FaEdit /> Edit Profile
              </button>
            )}
          </div>
        </div>
        <div className="profile-middle-section">
          <div className="personal-info-card">
            <h3>Personal Information</h3>
            <div className="info-field">
              <label>Full Name:</label>
              {editing ? (
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="edit-input"
                />
              ) : (
                <span>{profile?.name || 'Not set'}</span>
              )}
            </div>
            <div className="info-field">
              <label>Email:</label>
              <span>{profile?.email}</span>
            </div>
            <div className="info-field">
              <label>Phone:</label>
              {editing ? (
                <input
                  type="tel"
                  value={editForm.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="edit-input"
                />
              ) : (
                <span>{profile?.phone || 'Not set'}</span>
              )}
            </div>
            <div className="info-field">
              <label>Username:</label>
              {editing ? (
                <input
                  type="text"
                  value={editForm.username || ''}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="edit-input"
                />
              ) : (
                <span>{profile?.username || 'Not set'}</span>
              )}
            </div>
            <div className="info-field">
              <label>Bio:</label>
              {editing ? (
                <textarea
                  value={editForm.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="edit-textarea"
                  rows="3"
                />
              ) : (
                <span>{profile?.bio || 'Not set'}</span>
              )}
            </div>
            <div className="info-field">
              <label>Address:</label>
              {editing ? (
                <input
                  type="text"
                  value={editForm.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="edit-input"
                />
              ) : (
                <span>{profile?.address || 'Not set'}</span>
              )}
            </div>
            <div className="info-field">
              <label>Date of Birth:</label>
              {editing ? (
                <input
                  type="date"
                  value={editForm.dateOfBirth ? editForm.dateOfBirth.split('T')[0] : ''}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="edit-input"
                />
              ) : (
                <span>{formatDate(profile?.dateOfBirth)}</span>
              )}
            </div>
            <div className="info-field">
              <label>Gender:</label>
              {editing ? (
                <select
                  value={editForm.gender || ''}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="edit-select"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <span>{profile?.gender || 'Not set'}</span>
              )}
            </div>
            {!editing && (
              <button className="edit-info-btn" onClick={handleEditProfile}>
                <FaEdit /> Edit
              </button>
            )}
          </div>
          <div className="quick-stats-card">
            <h3>Quick Stats</h3>
            <div className="stat-item">
              <h4>Mood Entries Logged</h4>
              <p>{profile?.moodEntriesCount || 0}</p>
            </div>
            <div className="stat-item">
              <h4>Activities Completed</h4>
              <p>{profile?.activitiesCompleted || 0}</p>
            </div>
            <div className="stat-item">
              <h4>Balance Score</h4>
              <p>{profile?.balanceScore ? `${profile.balanceScore}/10` : '0/10'}</p>
            </div>
          </div>
        </div>
        <div className="profile-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;