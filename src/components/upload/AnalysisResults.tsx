import React from 'react'
import { 
  BookOpen, 
  Target, 
  BarChart3, 
  Clock, 
  Zap, 
  Globe, 
  FileText,
  TrendingUp,
  Award,
  Brain
} from 'lucide-react'

interface AnalysisResultsProps {
  analysis: {
    summary: string
    keyTopics: string[]
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
    estimatedReadTime: string
    suggestedQuestions: string[]
    extractedText?: string
    wordCount?: number
    language?: string
  }
  fileName: string
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  analysis,
  fileName
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-700 border-green-200'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'Advanced': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '🌱'
      case 'Intermediate': return '🌿'
      case 'Advanced': return '🌳'
      default: return '📚'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-2">
          <Brain className="w-6 h-6 text-primary-600" />
          <h3 className="text-xl font-bold text-gray-900">AI Analysis Results</h3>
        </div>
        <p className="text-gray-600">Comprehensive analysis of: <span className="font-medium">{fileName}</span></p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Read Time</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{analysis.estimatedReadTime}</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <FileText className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Words</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {analysis.wordCount ? analysis.wordCount.toLocaleString() : 'N/A'}
          </p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <Globe className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-600">Language</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{analysis.language || 'English'}</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-gray-600">Topics</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{analysis.keyTopics.length}</p>
        </div>
      </div>

      {/* Main Analysis Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Summary */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <BookOpen className="w-5 h-5 text-primary-600" />
            <h4 className="text-lg font-semibold text-gray-900">Summary</h4>
          </div>
          <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
        </div>

        {/* Difficulty Assessment */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="w-5 h-5 text-secondary-600" />
            <h4 className="text-lg font-semibold text-gray-900">Difficulty Level</h4>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getDifficultyIcon(analysis.difficulty)}</span>
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(analysis.difficulty)}`}>
                {analysis.difficulty}
              </span>
              <p className="text-sm text-gray-600 mt-1">
                {analysis.difficulty === 'Beginner' && 'Great for newcomers to the topic'}
                {analysis.difficulty === 'Intermediate' && 'Requires some background knowledge'}
                {analysis.difficulty === 'Advanced' && 'Complex material for experienced learners'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Topics */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <Target className="w-5 h-5 text-accent-600" />
          <h4 className="text-lg font-semibold text-gray-900">Key Topics</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {analysis.keyTopics.map((topic, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 rounded-full text-sm font-medium border border-primary-200 hover:shadow-md transition-shadow"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Study Questions */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <Zap className="w-5 h-5 text-yellow-600" />
          <h4 className="text-lg font-semibold text-gray-900">Suggested Study Questions</h4>
        </div>
        <div className="space-y-3">
          {analysis.suggestedQuestions.map((question, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </span>
              <p className="text-gray-700">{question}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          <Award className="w-4 h-4" />
          <span>Generate Quiz</span>
        </button>
        <button className="flex items-center space-x-2 px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors">
          <TrendingUp className="w-4 h-4" />
          <span>Create Flashcards</span>
        </button>
        <button className="flex items-center space-x-2 px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors">
          <Brain className="w-4 h-4" />
          <span>Study Plan</span>
        </button>
      </div>
    </div>
  )
}