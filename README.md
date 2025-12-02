# PsyPlex AI RAG Chatbot Implementation

## Overview

PsyPlex AI is a comprehensive mental health support platform that integrates a RAG (Retrieval-Augmented Generation) based chatbot with user data analysis. The system replaces the old empathetic chatbot with a personalized AI assistant that uses user profile information, browsing history, mood tracking data, and domain classification to provide tailored responses.

The platform consists of a React frontend, multiple backend microservices, and Python-based data processing services. It leverages modern AI technologies including LangChain, OpenAI embeddings, Groq LLM, and ChromaDB for vector storage.

## Features

- **User Authentication & Profile Management**: Secure user registration, login, OTP verification, and profile management with image uploads.
- **RAG-Based Chatbot**: Personalized AI conversations using user data for context-aware responses.
- **Browsing History Analysis**: Automated extraction and processing of Chrome browsing history.
- **Domain Classification**: Machine learning model to categorize websites and predict user emotions.
- **Mood Tracking Dashboard**: Visual analytics for mood trends, correlations, and insights.
- **API Gateway**: Centralized routing for all microservices.
- **Vector Database**: ChromaDB integration for efficient data retrieval.

## Architecture

The system follows a microservices architecture:

- **Frontend**: React application built with Vite
- **API Gateway**: Express.js proxy server routing requests to appropriate services
- **Auth Service**: Node.js/Express service handling authentication
- **User Service**: Node.js/Express service managing user profiles and data
- **Browsing History Service**: Python/Flask service for Chrome history extraction
- **Domain Classification Service**: Python/Flask service for URL classification and emotion analysis
- **Chatbot Service**: Python/FastAPI service implementing RAG chatbot with LangChain

## Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- MongoDB (for user data storage)
- Chrome browser (for browsing history extraction)
- Git

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Gen-AI
   ```

2. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

3. **Install backend service dependencies:**

   - API Gateway:
     ```bash
     cd backend/api-gateway
     npm install
     cd ../..
     ```

   - Auth Service:
     ```bash
     cd backend/auth-service
     npm install
     cd ../..
     ```

   - User Service:
     ```bash
     cd backend/user-service
     npm install
     cd ../..
     ```

   - Browsing History Service:
     ```bash
     cd backend/browsing-history
     pip install -r requirements.txt
     cd ../..
     ```

   - Chatbot Service:
     ```bash
     cd backend/chatbot
     pip install -r requirements.txt
     cd ../..
     ```

   - Domain Classification Service:
     ```bash
     cd backend/Domain_Classification
     pip install -r requirements.txt
     cd ../..
     ```

## Environment Setup

Create `.env` files for each service:

### API Gateway (.env in backend/api-gateway/)
```
PORT=3000
AUTH_SERVICE_URL=http://localhost:3001
USER_SERVICE_URL=http://localhost:3002
MOOD_SERVICE_URL=http://localhost:3003
```

### Auth Service (.env in backend/auth-service/)
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/psyplex_auth
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

### User Service (.env in backend/user-service/)
```
PORT=3002
MONGODB_URI=mongodb://localhost:27017/psyplex_users
JWT_SECRET=your_jwt_secret
```

### Chatbot Service (.env in backend/chatbot/)
```
CHATBOT_PORT=9000
OPENAI_API_KEY=your_openai_api_key
GROQ_API_KEY=your_groq_api_key
```

## Running the Services

### Start MongoDB
Ensure MongoDB is running on your system.

### Start Backend Services

1. **API Gateway:**
   ```bash
   cd backend/api-gateway
   npm start
   ```

2. **Auth Service:**
   ```bash
   cd backend/auth-service
   npm start
   ```

3. **User Service:**
   ```bash
   cd backend/user-service
   npm start
   ```

4. **Browsing History Service:**
   ```bash
   cd backend/browsing-history
   python main.py
   ```

5. **Domain Classification Service:**
   ```bash
   cd backend/Domain_Classification
   python server.py
   ```

6. **Chatbot Service:**
   ```bash
   cd backend/chatbot
   python api.py
   ```

### Start Frontend

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - OTP verification
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### User Profile
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `POST /api/user/upload-profile-picture` - Upload profile picture

### Chatbot
- `POST /api/chat/message` - Send message to chatbot
- `GET /api/chat/health` - Health check

### Browsing History
- `GET /api/chrome-history/fetch` - Fetch browsing history
- `GET /api/chrome-history/files/history.csv` - Download history CSV

### Domain Classification
- `GET /api/model/auto_classify` - Auto classify URLs
- `GET /api/model/add_emotions` - Add emotion analysis
- `POST /api/model/correlation` - Get correlation insights
- `GET /api/model/get_emotion_data` - Get emotion data
- `GET /api/model/api/mood/generateMoodTrends` - Generate mood trends

## Usage

1. Register/Login through the frontend
2. Access the chatbot for personalized conversations
3. View mood tracking dashboard with analytics
4. Upload browsing history for analysis (requires Chrome browser)

## Development

### Frontend Development
```bash
cd frontend
npm run dev  # Start development server
npm run build  # Build for production
npm run preview  # Preview production build
```

### Testing
- Run frontend tests: `npm run lint`
- Test individual services by making requests to their endpoints

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact the development team or create an issue in the repository.
