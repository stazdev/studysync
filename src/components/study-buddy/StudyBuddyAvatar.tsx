import React from 'react'
import { studyBuddyPersonas } from '../../lib/gemini'

interface StudyBuddyAvatarProps {
  personaId: string
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  className?: string
}

export const StudyBuddyAvatar: React.FC<StudyBuddyAvatarProps> = ({
  personaId,
  size = 'md',
  animated = true,
  className = ''
}) => {
  const persona = studyBuddyPersonas.find(p => p.id === personaId) || studyBuddyPersonas[0]
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-4xl'
  }

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        bg-gradient-to-br from-primary-100 to-secondary-100 
        rounded-full flex items-center justify-center 
        shadow-lg border-2 border-white
        ${animated ? 'animate-float hover:scale-110' : ''} 
        transition-all duration-300 cursor-pointer
        ${className}
      `}
      title={persona.name}
    >
      <span className="select-none">
        {persona.avatar}
      </span>
    </div>
  )
}