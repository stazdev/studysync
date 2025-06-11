import React, { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Minimize2, Maximize2 } from 'lucide-react'
import { StudyBuddyAvatar } from './StudyBuddyAvatar'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { geminiService, studyBuddyPersonas } from '../../lib/gemini'

interface Message {
  id: string
  text: string
  sender: 'user' | 'buddy'
  timestamp: Date
}

interface StudyBuddyChatProps {
  personaId: string
  isMinimized?: boolean
  onToggleMinimize?: () => void
  className?: string
}

export const StudyBuddyChat: React.FC<StudyBuddyChatProps> = ({
  personaId,
  isMinimized = false,
  onToggleMinimize,
  className = ''
}) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const persona = studyBuddyPersonas.find(p => p.id === personaId) || studyBuddyPersonas[0]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    setIsTyping(true)

    try {
      const response = await geminiService.generateStudyBuddyResponse(
        userMessage.text,
        persona
      )

      // Simulate typing delay
      setTimeout(() => {
        setIsTyping(false)
        const buddyMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response,
          sender: 'buddy',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, buddyMessage])
        setIsLoading(false)
      }, 1000 + Math.random() * 1000) // 1-2 second delay
    } catch (error) {
      setIsTyping(false)
      setIsLoading(false)
      console.error('Error sending message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (isMinimized) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <button
          onClick={onToggleMinimize}
          className="bg-white rounded-full p-3 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110"
        >
          <StudyBuddyAvatar personaId={personaId} size="md" />
        </button>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-2xl shadow-2xl border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-t-2xl">
        <div className="flex items-center space-x-3">
          <StudyBuddyAvatar personaId={personaId} size="sm" />
          <div>
            <h3 className="font-semibold text-gray-900">{persona.name}</h3>
            <p className="text-xs text-gray-600">Your AI Study Buddy</p>
          </div>
        </div>
        {onToggleMinimize && (
          <button
            onClick={onToggleMinimize}
            className="p-2 rounded-lg hover:bg-white/50 transition-colors"
          >
            <Minimize2 className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="h-80 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <StudyBuddyAvatar personaId={personaId} size="lg" className="mx-auto mb-4" />
            <p>Hi! I'm {persona.name}. How can I help you study today?</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              } animate-slide-up`}
            >
              <p className="text-sm">{message.text}</p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-2xl flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-xs text-gray-500">{persona.name} is typing...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <Input
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask ${persona.name} anything...`}
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            size="md"
            className="px-4"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}