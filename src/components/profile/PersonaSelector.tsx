import React, { useState } from 'react'
import { studyBuddyPersonas, StudyBuddyPersona } from '../../lib/gemini'
import { Button } from '../ui/Button'
import { ChevronLeft, ChevronRight, Check, Sparkles, Brain, Star, Zap } from 'lucide-react'

interface PersonaSelectorProps {
  selectedPersona: string
  onPersonaSelect: (persona: StudyBuddyPersona) => void
  loading?: boolean
}

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({
  selectedPersona,
  onPersonaSelect,
  loading = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(
    studyBuddyPersonas.findIndex(p => p.id === selectedPersona) || 0
  )

  const nextPersona = () => {
    setCurrentIndex((prev) => (prev + 1) % studyBuddyPersonas.length)
  }

  const prevPersona = () => {
    setCurrentIndex((prev) => (prev - 1 + studyBuddyPersonas.length) % studyBuddyPersonas.length)
  }

  const currentPersona = studyBuddyPersonas[currentIndex]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Choose Your AI Study Buddy
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Select an AI personality that matches your learning style and preferences
        </p>
      </div>
      
      {/* Persona Carousel */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
        <div className="relative">
          {/* Navigation Buttons */}
          <div className="flex items-center justify-center mb-8">
            <button
              onClick={prevPersona}
              disabled={loading}
              className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors mr-6 disabled:opacity-50"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Persona Card */}
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl p-8 mx-4 min-w-[350px] text-center transform transition-all duration-300 hover:scale-105 border border-primary-200 dark:border-primary-800">
              <div className="text-6xl mb-6 animate-bounce-in">
                {currentPersona.avatar}
              </div>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {currentPersona.name}
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                {currentPersona.description}
              </p>
              
              {/* Personality Traits */}
              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Brain className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Personality</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentPersona.personality}
                </p>
              </div>
              
              {/* Features */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
                  <Star className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Expert</span>
                </div>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
                  <Zap className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Interactive</span>
                </div>
              </div>
              
              {/* Selection Status */}
              {selectedPersona === currentPersona.id && (
                <div className="flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
                  <Check className="w-5 h-5 mr-2" />
                  <span className="font-medium">Currently Selected</span>
                </div>
              )}
            </div>

            <button
              onClick={nextPersona}
              disabled={loading}
              className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ml-6 disabled:opacity-50"
            >
              <ChevronRight className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-2 mb-8">
            {studyBuddyPersonas.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                disabled={loading}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? 'bg-primary-600 scale-125'
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
              />
            ))}
          </div>

          {/* Select Button */}
          <div className="text-center">
            <Button
              onClick={() => onPersonaSelect(currentPersona)}
              loading={loading}
              disabled={selectedPersona === currentPersona.id}
              size="lg"
              className="px-8"
            >
              {selectedPersona === currentPersona.id ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Selected
                </>
              ) : (
                'Select This Buddy'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* All Personas Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">All AI Study Buddies</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {studyBuddyPersonas.map((persona, index) => (
            <button
              key={persona.id}
              onClick={() => {
                setCurrentIndex(index)
                onPersonaSelect(persona)
              }}
              disabled={loading}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                selectedPersona === persona.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{persona.avatar}</div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 dark:text-white">{persona.name}</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{persona.description}</p>
                </div>
                {selectedPersona === persona.id && (
                  <Check className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-200">About AI Study Buddies</h4>
            <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
              Your AI Study Buddy will help you with questions, generate study materials, and provide personalized learning support. 
              Each buddy has a unique personality and teaching style to match your preferences.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}