import React from 'react'
import { User } from 'lucide-react'

interface AvatarProps {
  src?: string
  alt?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  fallback?: string
  className?: string
  onClick?: () => void
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  size = 'md',
  fallback,
  className = '',
  onClick
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl'
  }

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    '2xl': 'w-10 h-10'
  }

  return (
    <div
      className={`
        ${sizeClasses[size]} 
        rounded-full 
        overflow-hidden 
        bg-gradient-to-br from-primary-600 to-secondary-600 
        flex items-center justify-center 
        text-white font-medium
        ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Hide image on error to show fallback
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
          }}
        />
      ) : fallback ? (
        <span className="select-none">{fallback}</span>
      ) : (
        <User className={iconSizes[size]} />
      )}
    </div>
  )
}