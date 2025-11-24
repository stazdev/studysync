# StudySync - AI-Powered Collaborative Learning Platform

StudySync is a modern web application that combines AI-powered study assistance with collaborative learning features. Upload documents, generate quizzes, join study groups, and get personalized help from AI study buddies.

## Features

- 🤖 **AI Study Buddy**: Personalized AI tutors with different personalities
- 📚 **Document Analysis**: Upload PDFs, images, and text for AI-powered analysis
- 🧠 **Smart Quizzes**: Auto-generated quizzes from your study materials
- 👥 **Study Groups**: Collaborative learning with real-time chat
- 📊 **Progress Tracking**: Monitor your learning journey with detailed analytics
- 🎨 **Modern UI**: Beautiful, responsive design with dark mode support

## Quick Setup

### 1. Backend Setup

Navigate to the `backend` directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with the following credentials:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/studysync
JWT_SECRET=your_secure_secret_key
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
```

Start the backend server:

```bash
npm run dev
```

### 2. Frontend Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file in the root directory:

```
VITE_GEMINI_API_KEY=your_gemini_api_key_here # Optional if AI is fully handled by backend
```

Start the frontend development server:

```bash
npm run dev
```

### 3. Database Setup

Ensure you have MongoDB running locally or provide a valid MongoDB Atlas URI in `backend/.env`.

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express.js, Mongoose (MongoDB), Socket.io
- **AI**: Google Gemini API

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
