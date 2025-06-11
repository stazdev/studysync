import React, { useState, useEffect } from 'react'
import { StudyBuddyChat } from './StudyBuddyChat'
import { StudyBuddyAvatar } from './StudyBuddyAvatar'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { geminiService } from '../../lib/gemini'

interface StudyBuddyWidgetProps {
  className?: string
}

export const StudyBuddyWidget: React.FC<StudyBuddyWidgetProps> = ({ className = '' }) => {
  const { user } = useAuth()
  const [isMinimized, setIsMinimized] = useState(true)
  const [personaId, setPersonaId] = useState('professor-synapse')
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUserPersona()
    }
  }, [user])

  const fetchUserPersona = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('study_buddy_persona, username')
        .eq('id', user.id)
        .single()

      if (error) throw error

      const selectedPersona = data.study_buddy_persona || 'professor-synapse'
      setPersonaId(selectedPersona)

      // Generate welcome message
      const persona = await import('../../lib/gemini').then(m => 
        m.studyBuddyPersonas.find(p => p.id === selectedPersona) || m.studyBuddyPersonas[0]
      )
      
      const welcome = await geminiService.generateWelcomeMessage(persona, data.username)
      setWelcomeMessage(welcome)
      setShowWelcome(true)

      // Hide welcome message after 5 seconds
      setTimeout(() => setShowWelcome(false), 5000)
    } catch (error) {
      console.error('Error fetching user persona:', error)
    }
  }

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
    setShowWelcome(false)
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Welcome Message Bubble */}
      {showWelcome && isMinimized && (
        <div className="absolute bottom-16 right-0 mb-2 mr-2 max-w-xs">
          <div className="bg-white rounded-2xl p-4 shadow-xl border border-gray-200 animate-slide-up">
            <div className="flex items-start space-x-3">
              <StudyBuddyAvatar personaId={personaId} size="sm" animated={false} />
              <div className="flex-1">
                <p className="text-sm text-gray-800">{welcomeMessage}</p>
                <button
                  onClick={() => setShowWelcome(false)}
                  className="text-xs text-gray-500 hover:text-gray-700 mt-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
            {/* Speech bubble arrow */}
            <div className="absolute bottom-0 right-8 transform translate-y-1/2 rotate-45 w-3 h-3 bg-white border-r border-b border-gray-200"></div>
          </div>
        </div>
      )}

      {/* Chat Interface */}
      {isMinimized ? (
        <button
          onClick={toggleMinimize}
          className="bg-white rounded-full p-4 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 group"
        >
          <StudyBuddyAvatar personaId={personaId} size="md" />
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-secondary-500 rounded-full animate-pulse"></div>
        </button>
      ) : (
        <div className="w-96 h-[500px]">
          <StudyBuddyChat
            personaId={personaId}
            isMinimized={false}
            onToggleMinimize={toggleMinimize}
            className="w-full h-full"
          />
        </div>
      )}
    </div>
  )
}