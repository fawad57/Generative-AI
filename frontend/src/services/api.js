import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, try to refresh
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const refreshResponse = await axios.post(
            `${import.meta.env.VITE_API_URL}/auth/refresh`,
            {
              refreshToken,
            }
          );
          const newToken = refreshResponse.data.token;
          localStorage.setItem("token", newToken);
          // Retry the original request
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return axios(error.config);
        } catch {
          // Refresh failed, logout
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
        }
      } else {
        // No refresh token, logout
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Profile API functions
export const profileAPI = {
  getProfile: () => api.get("/user/profile"),
  updateProfile: (data) => api.put("/user/profile", data),
};

// Browsing History API functions
export const browsingHistoryAPI = {
  fetchHistory: () => api.get("/chrome-history/fetch"),
};

export const browsingModelAPI = {
  getModelData: () => api.get("/model/auto_classify"),
};

//Add Emotion API functions
export const addEmotionAPI = {
  addEmotion: () => api.get("/model/add_emotions"),
};

// Domain Classification API functions - Direct connection to domain classification service
const domainAPI = axios.create({
  baseURL: 'http://localhost:8000',
});

export const domainClassificationAPI = {
  getEmotionData: () => domainAPI.get("/get_emotion_data"),
  getMoodTrends: (period = 'daily') => domainAPI.get(`/api/mood/generateMoodTrends?period=${period}`),
};

// Mood API
export const moodAPI = {
  // range: daily|weekly|monthly
  getMoodTracks: (range = 'daily', user = undefined) => api.get(`/mood/tracks?range=${encodeURIComponent(range)}${user ? `&user=${encodeURIComponent(user)}` : ''}`),
  addMoodTrack: (payload) => api.post('/mood/track', payload),
  getCorrelation: (user = undefined) => api.get(`/mood/correlation${user ? `?user=${encodeURIComponent(user)}` : ''}`),
};

// Chatbot API functions
export const chatbotAPI = {
  sendMessage: (message) => api.post("/chat/message", { message }),
};

export default api;
