import React from 'react'
import { GraduationCap, Sparkles } from 'lucide-react'

interface AuthLayoutProps {
  children: React.ReactNode
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200 rounded-full opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-200 rounded-full opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-center lg:justify-between">
        {/* Left side - Branding */}
        <div className="hidden lg:flex flex-col items-start max-w-lg">
          <div className="flex items-center mb-8">
            <div className="bg-primary-600 p-3 rounded-2xl mr-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">StudySync</h1>
          </div>
          
          <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Transform Your
            <span className="text-primary-600 block">Learning Journey</span>
          </h2>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Harness the power of AI to create personalized study experiences, 
            collaborate with peers, and master any subject faster than ever before.
          </p>

          <div className="space-y-4">
            <div className="flex items-center">
              <Sparkles className="w-6 h-6 text-primary-600 mr-3" />
              <span className="text-lg text-gray-700">AI-powered study materials</span>
            </div>
            <div className="flex items-center">
              <Sparkles className="w-6 h-6 text-secondary-600 mr-3" />
              <span className="text-lg text-gray-700">Collaborative study rooms</span>
            </div>
            <div className="flex items-center">
              <Sparkles className="w-6 h-6 text-accent-600 mr-3" />
              <span className="text-lg text-gray-700">Personalized learning paths</span>
            </div>
          </div>
        </div>

        {/* Right side - Auth forms */}
        <div className="w-full lg:w-auto lg:min-w-[400px]">
          {children}
        </div>
      </div>
    </div>
  )
}