import { useState, useEffect } from 'react';
import '../../styles/MoodTracking/MoodTrackingDashboard.css';
import Sidebar from '../../components/Sidebar';
import { FaUserCircle, FaBars } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { Line, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { domainClassificationAPI } from '../../services/api';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MoodTrackingDashboard = () => {
  const [selectedRange, setSelectedRange] = useState('daily');
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default to open
  const [emotionData, setEmotionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [moodTrendsData, setMoodTrendsData] = useState(null);
  const [moodTrendsLoading, setMoodTrendsLoading] = useState(false);
  const [moodTrendsError, setMoodTrendsError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const location = useLocation();
  const email = location.state?.email || 'User';

  useEffect(() => {
    const fetchEmotionData = async () => {
      try {
        setLoading(true);
        const response = await domainClassificationAPI.getEmotionData();
        setEmotionData(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching emotion data:', err);
        setError('Failed to load emotion data');
      } finally {
        setLoading(false);
      }
    };

    fetchEmotionData();
  }, []);

  useEffect(() => {
    const fetchMoodTrends = async () => {
      try {
        setMoodTrendsLoading(true);
        const response = await domainClassificationAPI.getMoodTrends(selectedPeriod);
        setMoodTrendsData(response.data);
        setMoodTrendsError(null);
      } catch (err) {
        console.error('Error fetching mood trends:', err);
        setMoodTrendsError('Failed to load mood trends');
      } finally {
        setMoodTrendsLoading(false);
      }
    };

    fetchMoodTrends();
  }, [selectedPeriod]);

  const handleRangeChange = (range) => {
    setSelectedRange(range);
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Process emotion data for charts
  const processEmotionData = (data) => {
    if (!data || !Array.isArray(data) || data.length === 0) return null;

    // Group by date (assuming there's a date field, or use index as proxy)
    const dailyData = {};
    const weeklyData = {};
    const monthlyData = {};

    data.forEach((item, index) => {
      const date = new Date(); // Placeholder, replace with actual date field
      date.setDate(date.getDate() - index); // Simulate dates
      const dateStr = date.toLocaleDateString();
      const weekStr = `Week ${Math.floor(index / 7) + 1}`;
      const monthStr = date.toLocaleString('default', { month: 'short' });

      const score = item.emotion_score || 3; // Default to neutral

      // Daily
      if (!dailyData[dateStr]) dailyData[dateStr] = [];
      dailyData[dateStr].push(score);

      // Weekly
      if (!weeklyData[weekStr]) weeklyData[weekStr] = [];
      weeklyData[weekStr].push(score);

      // Monthly
      if (!monthlyData[monthStr]) monthlyData[monthStr] = [];
      monthlyData[monthStr].push(score);
    });

    return {
      daily: {
        labels: Object.keys(dailyData).slice(-7), // Last 7 days
        datasets: [{
          label: 'Mood Score',
          data: Object.values(dailyData).slice(-7).map(scores => scores.reduce((a, b) => a + b, 0) / scores.length),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          fill: true,
          tension: 0.4,
        }],
      },
      weekly: {
        labels: Object.keys(weeklyData).slice(-4), // Last 4 weeks
        datasets: [{
          label: 'Mood Score',
          data: Object.values(weeklyData).slice(-4).map(scores => scores.reduce((a, b) => a + b, 0) / scores.length),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          fill: true,
          tension: 0.4,
        }],
      },
      monthly: {
        labels: Object.keys(monthlyData).slice(-2), // Last 2 months
        datasets: [{
          label: 'Mood Score',
          data: Object.values(monthlyData).slice(-2).map(scores => scores.reduce((a, b) => a + b, 0) / scores.length),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          fill: true,
          tension: 0.4,
        }],
      },
    };
  };

  const moodData = emotionData && Array.isArray(emotionData) && emotionData.length > 0 ? processEmotionData(emotionData) : {
    daily: {
      labels: ['10/10', '10/11', '10/12', '10/13', '10/14', '10/15', '10/16'],
      datasets: [
        {
          label: 'Mood Score',
          data: [3, 4, 2, 5, 3, 4, 5], // Scale: 1-5 (1 = Sad, 5 = Happy)
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          fill: true,
          tension: 0.4,
        },
      ],
    },
    weekly: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [
        {
          label: 'Mood Score',
          data: [3.2, 3.8, 3.5, 4.0],
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          fill: true,
          tension: 0.4,
        },
      ],
    },
    monthly: {
      labels: ['Sep', 'Oct'],
      datasets: [
        {
          label: 'Mood Score',
          data: [3.5, 3.8],
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          fill: true,
          tension: 0.4,
        },
      ],
    },
  };

  const weeklyAverageData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Weekly Mood',
        data: [3, 4, 3, 4, 5, 4, 3],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const correlationData = {
    datasets: [
      {
        label: 'Browsing Hours vs Mood',
        data: [
          { x: 2, y: 4 },
          { x: 4, y: 3 },
          { x: 6, y: 2 },
          { x: 8, y: 1 },
          { x: 3, y: 5 },
        ],
        backgroundColor: '#3B82F6',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allow custom height/width
    plugins: {
      legend: { position: 'top' },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        title: { display: true, text: 'Mood Score (1-5)' },
      },
      x: {
        title: { display: true, text: 'Days' }, // For daily/weekly/monthly
      },
    },
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />

      {/* Main Content */}
      <div className="main-content">
        {/* Top Navbar */}
        <div className="navbar">
          <div className="menu-toggle" onClick={handleSidebarToggle}>
            <FaBars />
          </div>
          <div className="right-group">
            <div className="flex items-center gap-4">
              <span className="badge">
                Today: Energetic ⚡
              </span>
            </div>
            <Link to="/profile" className="user-profile">
              <FaUserCircle />
              <span>{email}</span>
            </Link>
          </div>
        </div>

        {/* Header */}
        <h1 className="dashboard-header">Mood Tracking Dashboard 🌈</h1>

        {/* Top Cards */}
        <div className="top-cards">
          <div className="card">
            <h3>Today’s Mood</h3>
            <div className="mood-emoji">😌</div>
            <p>Calm</p>
          </div>
          <div className="card">
            <h3>Weekly Average Mood</h3>
            <div className="chart-container">
              <Line data={weeklyAverageData} options={options} />
            </div>
            <p>Neutral</p>
          </div>
          <div className="card">
            <h3>Monthly Trend</h3>
            <div className="chart-container">
              <Line data={moodData.monthly} options={options} />
            </div>
            <p>Stable</p>
          </div>
        </div>

        {/* Mood Trends Section */}
        <div className="mood-trends-section">
          {moodTrendsData && moodTrendsData.emotion_distribution && (
            <div className="chart-card">
              <h2>Emotion Breakdown (Time Spent)</h2>
              <div className="chart-container large-chart">
                <Line
                  data={{
                    labels: moodTrendsData.emotion_distribution.map(d => d.emotion),
                    datasets: [{
                      label: "Number of visits",
                      data: moodTrendsData.emotion_distribution.map(d => d.visit_count),
                      borderWidth: 1,
                      backgroundColor: '#3B82F6',
                      borderColor: '#3B82F6'
                    }]
                  }}
                  options={{
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: (ctx) => {
                            const i = ctx.dataIndex;
                            const dist = moodTrendsData.emotion_distribution[i];
                            return [
                              `Visits: ${dist.visit_count}`,
                              `Approx time: ${dist.total_minutes.toFixed(1)} min`
                            ];
                          }
                        },
                        legend: { display: false }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: { display: true, text: "Number of visits" }
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="right-sidebar">
          <div className="widget-card">
            <h3>Quick Mood Summary</h3>
            <p>You felt positive 65% of the time this week</p>
          </div>
          <div className="widget-card">
            <h3>Correlation</h3>
            <div className="chart-container">
              <Scatter data={correlationData} options={options} />
            </div>
            <p>Browsing hours vs. Mood</p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="bottom-section">
          <h3>Mood History</h3>
          <div className="mood-timeline">
            <span className="mood-item">😊 10/10</span>
            <span className="mood-item">😌 10/11</span>
            <span className="mood-item">😔 10/12</span>
            <span className="mood-item">😄 10/13</span>
            <span className="mood-item">😞 10/14</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodTrackingDashboard;