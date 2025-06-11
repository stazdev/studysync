import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Users, MessageSquare, Share2, Settings, Monitor, Hand, FileText, Keyboard as Whiteboard, Clock, User, Crown, Shield, Volume2, VolumeX, Camera, CameraOff, MoreVertical, Maximize, Minimize, Copy, Link, Download, Upload, Presentation, BookOpen, Target, Brain, Zap, Award, TrendingUp, CheckCircle, AlertCircle, Info, X, Send, Smile, Paperclip, Image, File } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

interface Participant {
  id: string
  name: string
  avatar: string
  role: 'host' | 'moderator' | 'participant'
  isVideoOn: boolean
  isAudioOn: boolean
  isHandRaised: boolean
  joinedAt: string
  stream?: MediaStream
  isScreenSharing?: boolean
}

interface ChatMessage {
  id: string
  userId: string
  userName: string
  userAvatar: string
  message: string
  timestamp: Date
  type: 'text' | 'file' | 'system'
  fileUrl?: string
  fileName?: string
}

interface SessionResource {
  id: string
  name: string
  type: 'document' | 'presentation' | 'whiteboard' | 'quiz'
  url?: string
  sharedBy: string
  sharedAt: string
}

export const StudySessionPage: React.FC = () => {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { success, error, info } = useToast()
  
  // Session state
  const [isConnected, setIsConnected] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(false)
  const [isAudioOn, setIsAudioOn] = useState(false)
  const [isHandRaised, setIsHandRaised] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [sessionDuration, setSessionDuration] = useState(0)
  const [participants, setParticipants] = useState<Participant[]>([])
  
  // Media state
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [isMediaLoading, setIsMediaLoading] = useState(false)
  
  // UI state
  const [showChat, setShowChat] = useState(true)
  const [showParticipants, setShowParticipants] = useState(false)
  const [showResources, setShowResources] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [resources, setResources] = useState<SessionResource[]>([])
  
  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const screenVideoRef = useRef<HTMLVideoElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  
  // Mock session data
  const sessionInfo = {
    id: sessionId || '1',
    title: 'Advanced Calculus Study Session',
    groupName: 'Advanced Calculus Study Circle',
    host: 'Dr. Sarah Chen',
    topic: 'Integration Techniques',
    startTime: new Date(Date.now() - 1800000), // Started 30 minutes ago
    duration: 90, // 90 minutes planned
    maxParticipants: 20
  }

  useEffect(() => {
    // Initialize mock data
    const mockParticipants: Participant[] = [
      {
        id: '1',
        name: 'Dr. Sarah Chen',
        avatar: '👩‍🏫',
        role: 'host',
        isVideoOn: true,
        isAudioOn: true,
        isHandRaised: false,
        joinedAt: '30 min ago',
        isScreenSharing: false
      },
      {
        id: '2',
        name: 'Alex Rodriguez',
        avatar: '👨‍🎓',
        role: 'moderator',
        isVideoOn: true,
        isAudioOn: true,
        isHandRaised: false,
        joinedAt: '25 min ago',
        isScreenSharing: false
      },
      {
        id: '3',
        name: 'Emma Wilson',
        avatar: '👩‍💼',
        role: 'participant',
        isVideoOn: false,
        isAudioOn: true,
        isHandRaised: true,
        joinedAt: '20 min ago',
        isScreenSharing: false
      },
      {
        id: user?.id || '4',
        name: user?.user_metadata?.username || 'You',
        avatar: '👤',
        role: 'participant',
        isVideoOn: isVideoOn,
        isAudioOn: isAudioOn,
        isHandRaised: isHandRaised,
        joinedAt: 'just now',
        isScreenSharing: isScreenSharing
      }
    ]

    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        userId: '1',
        userName: 'Dr. Sarah Chen',
        userAvatar: '👩‍🏫',
        message: 'Welcome everyone! Today we\'ll be covering integration by parts.',
        timestamp: new Date(Date.now() - 1800000),
        type: 'text'
      },
      {
        id: '2',
        userId: 'system',
        userName: 'System',
        userAvatar: '🤖',
        message: 'Alex Rodriguez joined the session',
        timestamp: new Date(Date.now() - 1500000),
        type: 'system'
      },
      {
        id: '3',
        userId: '2',
        userName: 'Alex Rodriguez',
        userAvatar: '👨‍🎓',
        message: 'Thanks for hosting this session! I have some questions about the u-substitution method.',
        timestamp: new Date(Date.now() - 1200000),
        type: 'text'
      }
    ]

    const mockResources: SessionResource[] = [
      {
        id: '1',
        name: 'Integration Techniques Slides',
        type: 'presentation',
        url: '#',
        sharedBy: 'Dr. Sarah Chen',
        sharedAt: '25 min ago'
      },
      {
        id: '2',
        name: 'Practice Problems',
        type: 'document',
        url: '#',
        sharedBy: 'Alex Rodriguez',
        sharedAt: '15 min ago'
      },
      {
        id: '3',
        name: 'Whiteboard Notes',
        type: 'whiteboard',
        sharedBy: 'Dr. Sarah Chen',
        sharedAt: '10 min ago'
      }
    ]

    setParticipants(mockParticipants)
    setChatMessages(mockMessages)
    setResources(mockResources)
    
    // Simulate joining the session
    setTimeout(() => {
      setIsConnected(true)
      success('Connected to session', 'You have joined the study session')
    }, 1000)

    // Session timer
    const timer = setInterval(() => {
      setSessionDuration(prev => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [user, isVideoOn, isAudioOn, isHandRaised, isScreenSharing, success])

  // Update participants when screen sharing state changes
  useEffect(() => {
    setParticipants(prev => prev.map(participant => 
      participant.id === user?.id 
        ? { ...participant, isScreenSharing }
        : { ...participant, isScreenSharing: false } // Only one person can share at a time
    ))
  }, [isScreenSharing, user?.id])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // Cleanup media streams on unmount
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop())
      }
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [localStream, screenStream])

  // Initialize user media when video/audio is turned on
  useEffect(() => {
    if (isVideoOn || isAudioOn) {
      initializeUserMedia()
    } else {
      stopUserMedia()
    }
  }, [isVideoOn, isAudioOn])

  const initializeUserMedia = async () => {
    setIsMediaLoading(true)
    setMediaError(null)

    try {
      const constraints: MediaStreamConstraints = {
        video: isVideoOn ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        } : false,
        audio: isAudioOn ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : false
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      setLocalStream(stream)

      // Set video element source
      if (localVideoRef.current && isVideoOn) {
        localVideoRef.current.srcObject = stream
      }

      // Mute audio track if audio is off
      if (!isAudioOn) {
        stream.getAudioTracks().forEach(track => {
          track.enabled = false
        })
      }

      success('Media initialized', 'Camera and microphone are ready')
    } catch (err: any) {
      console.error('Error accessing media devices:', err)
      let errorMessage = 'Failed to access camera or microphone'
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera/microphone access denied. Please allow permissions and try again.'
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera or microphone found. Please check your devices.'
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Camera or microphone is already in use by another application.'
      }
      
      setMediaError(errorMessage)
      error('Media Error', errorMessage)
      
      // Reset states on error
      setIsVideoOn(false)
      setIsAudioOn(false)
    } finally {
      setIsMediaLoading(false)
    }
  }

  const stopUserMedia = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
      setLocalStream(null)
    }
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null
    }
  }

  const handleJoinSession = async () => {
    setIsConnected(true)
    info('Connecting...', 'Joining the study session')
  }

  const handleLeaveSession = () => {
    // Stop all media streams
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
    }
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop())
    }
    
    navigate('/groups')
    success('Left session', 'You have left the study session')
  }

  const toggleVideo = async () => {
    if (isMediaLoading) return

    if (!isVideoOn) {
      // Turning video on
      setIsVideoOn(true)
    } else {
      // Turning video off
      setIsVideoOn(false)
      if (localStream) {
        localStream.getVideoTracks().forEach(track => {
          track.stop()
        })
      }
    }
  }

  const toggleAudio = async () => {
    if (isMediaLoading) return

    if (!isAudioOn) {
      // Turning audio on
      setIsAudioOn(true)
    } else {
      // Turning audio off
      setIsAudioOn(false)
      if (localStream) {
        localStream.getAudioTracks().forEach(track => {
          track.enabled = false
        })
      }
    }
  }

  const toggleHandRaise = () => {
    setIsHandRaised(!isHandRaised)
    info(isHandRaised ? 'Hand lowered' : 'Hand raised', '')
  }

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop())
        setScreenStream(null)
      }
      
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = null
      }
      
      setIsScreenSharing(false)
      info('Screen sharing stopped', '')
    } else {
      // Start screen sharing
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 }
          },
          audio: true // Include system audio if available
        })

        setScreenStream(stream)
        
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = stream
        }

        // Listen for when user stops sharing via browser UI
        stream.getVideoTracks()[0].addEventListener('ended', () => {
          setIsScreenSharing(false)
          setScreenStream(null)
          if (screenVideoRef.current) {
            screenVideoRef.current.srcObject = null
          }
          info('Screen sharing stopped', '')
        })

        setIsScreenSharing(true)
        success('Screen sharing started', 'Your screen is now being shared')
      } catch (err: any) {
        console.error('Error starting screen share:', err)
        
        let errorMessage = 'Failed to start screen sharing'
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Screen sharing permission denied'
        } else if (err.name === 'NotSupportedError') {
          errorMessage = 'Screen sharing is not supported in this browser'
        }
        
        error('Screen Share Error', errorMessage)
      }
    }
  }

  const sendMessage = () => {
    if (!chatMessage.trim()) return

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: user?.id || 'user',
      userName: user?.user_metadata?.username || 'You',
      userAvatar: '👤',
      message: chatMessage,
      timestamp: new Date(),
      type: 'text'
    }

    setChatMessages(prev => [...prev, newMessage])
    setChatMessage('')
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'document': return FileText
      case 'presentation': return Presentation
      case 'whiteboard': return Whiteboard
      case 'quiz': return Brain
      default: return File
    }
  }

  // Get the current presenter (who is sharing screen or the host)
  const getCurrentPresenter = () => {
    const screenSharer = participants.find(p => p.isScreenSharing)
    if (screenSharer) {
      return screenSharer
    }
    // Default to host if no one is sharing
    return participants.find(p => p.role === 'host') || participants[0]
  }

  const currentPresenter = getCurrentPresenter()

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Join Study Session
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {sessionInfo.title}
            </p>
            
            <div className="space-y-3 mb-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Host:</span>
                <span className="font-medium">{sessionInfo.host}</span>
              </div>
              <div className="flex justify-between">
                <span>Topic:</span>
                <span className="font-medium">{sessionInfo.topic}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="font-medium">{sessionInfo.duration} minutes</span>
              </div>
            </div>

            {/* Media Error Display */}
            {mediaError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm text-red-700 dark:text-red-300">{mediaError}</span>
                </div>
              </div>
            )}

            <div className="flex space-x-3 mb-6">
              <Button
                variant="outline"
                onClick={toggleVideo}
                disabled={isMediaLoading}
                className={isVideoOn ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' : ''}
              >
                {isMediaLoading ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                ) : isVideoOn ? (
                  <Camera className="w-4 h-4" />
                ) : (
                  <CameraOff className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="outline"
                onClick={toggleAudio}
                disabled={isMediaLoading}
                className={isAudioOn ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' : ''}
              >
                {isMediaLoading ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                ) : isAudioOn ? (
                  <Mic className="w-4 h-4" />
                ) : (
                  <MicOff className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Local Video Preview */}
            {isVideoOn && localStream && (
              <div className="mb-6">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-32 bg-gray-900 rounded-lg object-cover"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Camera preview</p>
              </div>
            )}

            <Button
              onClick={handleJoinSession}
              className="w-full"
              size="lg"
              disabled={isMediaLoading}
            >
              <Video className="w-4 h-4 mr-2" />
              Join Session
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-white font-medium">{sessionInfo.title}</span>
            </div>
            <span className="text-gray-400 text-sm">•</span>
            <span className="text-gray-400 text-sm">{formatDuration(sessionDuration)}</span>
            <span className="text-gray-400 text-sm">•</span>
            <span className="text-gray-400 text-sm">{participants.length} participants</span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowParticipants(!showParticipants)}
              className="text-white hover:bg-gray-700"
            >
              <Users className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowResources(!showResources)}
              className="text-white hover:bg-gray-700"
            >
              <FileText className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowChat(!showChat)}
              className="text-white hover:bg-gray-700"
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-gray-700"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 relative">
          {/* Main Video Display */}
          <div className="h-full bg-gray-900 flex items-center justify-center relative">
            {isScreenSharing && screenStream ? (
              // Screen sharing view - show the actual screen content
              <video
                ref={screenVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            ) : (
              // Default participant view - show current presenter
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">{currentPresenter?.avatar || '👤'}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{currentPresenter?.name || 'Unknown'}</h3>
                  <div className="flex items-center justify-center space-x-2 text-gray-400">
                    {currentPresenter?.role === 'host' && (
                      <>
                        <Crown className="w-4 h-4 text-yellow-400" />
                        <span>Host</span>
                      </>
                    )}
                    {currentPresenter?.role === 'moderator' && (
                      <>
                        <Shield className="w-4 h-4 text-blue-400" />
                        <span>Moderator</span>
                      </>
                    )}
                    {currentPresenter?.isScreenSharing && (
                      <>
                        <span>•</span>
                        <Monitor className="w-4 h-4 text-green-400" />
                        <span>Sharing Screen</span>
                      </>
                    )}
                    {!currentPresenter?.isScreenSharing && currentPresenter?.role === 'host' && (
                      <>
                        <span>•</span>
                        <span>Presenting</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Screen Share Indicator */}
            {isScreenSharing && (
              <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                <Monitor className="w-4 h-4" />
                <span>You are sharing your screen</span>
              </div>
            )}

            {/* Media Error Overlay */}
            {mediaError && (
              <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-lg text-sm flex items-center space-x-2">
                <AlertCircle className="w-4 h-4" />
                <span>{mediaError}</span>
              </div>
            )}

            {/* Participant Grid */}
            <div className="absolute bottom-4 right-4 grid grid-cols-2 gap-2">
              {/* Your video */}
              {isVideoOn && localStream && (
                <div className="w-32 h-24 bg-gray-800 rounded-lg overflow-hidden relative border-2 border-primary-500">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                    You
                  </div>
                  {isScreenSharing && (
                    <div className="absolute top-1 right-1 bg-green-600 rounded-full p-1">
                      <Monitor className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>
              )}
              
              {/* Other participants */}
              {participants.filter(p => p.id !== user?.id).slice(0, isVideoOn ? 3 : 4).map((participant) => (
                <div
                  key={participant.id}
                  className="w-32 h-24 bg-gray-800 rounded-lg flex items-center justify-center relative border-2 border-gray-600"
                >
                  <div className="text-center text-white">
                    <div className="text-2xl mb-1">{participant.avatar}</div>
                    <div className="text-xs truncate">{participant.name}</div>
                  </div>
                  
                  {/* Status indicators */}
                  <div className="absolute bottom-1 left-1 flex space-x-1">
                    {!participant.isAudioOn && (
                      <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
                        <MicOff className="w-2 h-2 text-white" />
                      </div>
                    )}
                    {participant.isHandRaised && (
                      <div className="w-4 h-4 bg-yellow-600 rounded-full flex items-center justify-center">
                        <Hand className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Role indicator */}
                  {participant.role !== 'participant' && (
                    <div className="absolute top-1 right-1">
                      {participant.role === 'host' ? (
                        <Crown className="w-3 h-3 text-yellow-400" />
                      ) : (
                        <Shield className="w-3 h-3 text-blue-400" />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="bg-gray-800 rounded-full px-6 py-3 flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAudio}
                disabled={isMediaLoading}
                className={`rounded-full w-12 h-12 ${
                  isAudioOn 
                    ? 'text-white hover:bg-gray-700' 
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isMediaLoading ? (
                  <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : isAudioOn ? (
                  <Mic className="w-5 h-5" />
                ) : (
                  <MicOff className="w-5 h-5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleVideo}
                disabled={isMediaLoading}
                className={`rounded-full w-12 h-12 ${
                  isVideoOn 
                    ? 'text-white hover:bg-gray-700' 
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isMediaLoading ? (
                  <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : isVideoOn ? (
                  <Camera className="w-5 h-5" />
                ) : (
                  <CameraOff className="w-5 h-5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleScreenShare}
                className={`rounded-full w-12 h-12 ${
                  isScreenSharing 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'text-white hover:bg-gray-700'
                }`}
              >
                <Monitor className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleHandRaise}
                className={`rounded-full w-12 h-12 ${
                  isHandRaised 
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                    : 'text-white hover:bg-gray-700'
                }`}
              >
                <Hand className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLeaveSession}
                className="rounded-full w-12 h-12 bg-red-600 text-white hover:bg-red-700"
              >
                <PhoneOff className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        {(showChat || showParticipants || showResources) && (
          <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Sidebar Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowChat(true)
                  setShowParticipants(false)
                  setShowResources(false)
                }}
                className={`flex-1 px-4 py-3 text-sm font-medium ${
                  showChat
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => {
                  setShowChat(false)
                  setShowParticipants(true)
                  setShowResources(false)
                }}
                className={`flex-1 px-4 py-3 text-sm font-medium ${
                  showParticipants
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                People
              </button>
              <button
                onClick={() => {
                  setShowChat(false)
                  setShowParticipants(false)
                  setShowResources(true)
                }}
                className={`flex-1 px-4 py-3 text-sm font-medium ${
                  showResources
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Resources
              </button>
            </div>

            {/* Chat Panel */}
            {showChat && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.map((message) => (
                    <div key={message.id} className="flex space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm">
                        {message.userAvatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {message.userName}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className={`text-sm ${
                          message.type === 'system' 
                            ? 'text-gray-500 dark:text-gray-400 italic' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {message.message}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-2">
                    <Input
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Type a message..."
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={sendMessage} size="sm">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Participants Panel */}
            {showParticipants && (
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3">
                  {participants.map((participant) => (
                    <div key={participant.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        {participant.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900 dark:text-white truncate">
                            {participant.name}
                          </span>
                          {participant.role === 'host' && <Crown className="w-4 h-4 text-yellow-500" />}
                          {participant.role === 'moderator' && <Shield className="w-4 h-4 text-blue-500" />}
                          {participant.isScreenSharing && <Monitor className="w-4 h-4 text-green-500" />}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Joined {participant.joinedAt}
                          </span>
                          {participant.isHandRaised && (
                            <Hand className="w-3 h-3 text-yellow-500" />
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          participant.isAudioOn ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {participant.isAudioOn ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
                        </div>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          participant.isVideoOn ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {participant.isVideoOn ? <Camera className="w-3 h-3" /> : <CameraOff className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resources Panel */}
            {showResources && (
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3">
                  {resources.map((resource) => {
                    const Icon = getResourceIcon(resource.type)
                    return (
                      <div key={resource.id} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                            <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-white truncate">
                              {resource.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Shared by {resource.sharedBy} • {resource.sharedAt}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button variant="outline" className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Share Resource
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}