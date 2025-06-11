import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProfileProvider } from './contexts/ProfileContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './contexts/ToastContext'
import { PreferencesProvider } from './contexts/PreferencesContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { DashboardPage } from './pages/DashboardPage'
import { ProfilePage } from './pages/ProfilePage'
import { PreferencesPage } from './pages/PreferencesPage'
import { FeedbackPage } from './pages/FeedbackPage'
import { HelpSupportPage } from './pages/HelpSupportPage'
import { UploadPage } from './pages/UploadPage'
import { StudyGroupsPage } from './pages/StudyGroupsPage'
import { QuizPage } from './pages/QuizPage'
import { StudySessionPage } from './pages/StudySessionPage'
import { ChatPage } from './pages/ChatPage'

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <ProfileProvider>
            <PreferencesProvider>
              <Router>
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  
                  {/* Protected routes */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <DashboardLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Navigate to="/dashboard\" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="upload" element={<UploadPage />} />
                    <Route path="groups" element={<StudyGroupsPage />} />
                    <Route path="quiz" element={<QuizPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="preferences" element={<PreferencesPage />} />
                    <Route path="feedback" element={<FeedbackPage />} />
                    <Route path="help" element={<HelpSupportPage />} />
                  </Route>

                  {/* Standalone pages (outside dashboard layout) */}
                  <Route
                    path="/session/:sessionId"
                    element={
                      <ProtectedRoute>
                        <StudySessionPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/chat/:groupId"
                    element={
                      <ProtectedRoute>
                        <ChatPage />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Catch all */}
                  <Route path="*" element={<Navigate to="/dashboard\" replace />} />
                </Routes>
              </Router>
            </PreferencesProvider>
          </ProfileProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App