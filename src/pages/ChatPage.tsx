import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  MessageSquare, 
  Send, 
  Smile, 
  Paperclip, 
  Image, 
  File, 
  Phone, 
  Video, 
  Info, 
  Search, 
  MoreVertical, 
  ArrowLeft,
  Users,
  Settings,
  Bell,
  BellOff,
  Pin,
  Star,
  Reply,
  Edit3,
  Trash2,
  Copy,
  Forward,
  Download,
  Eye,
  EyeOff,
  Crown,
  Shield,
  User,
  Clock,
  CheckCircle,
  Check,
  AlertCircle,
  Plus,
  Hash,
  AtSign,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Share2,
  BookOpen,
  Brain,
  Target,
  Zap,
  Award,
  TrendingUp,
  Calendar,
  Link,
  ExternalLink,
  FileText,
  ImageIcon,
  VideoIcon,
  Music,
  Archive,
  X
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

interface ChatMessage {
  id: string
  userId: string
  userName: string
  userAvatar: string
  message: string
  timestamp: Date
  type: 'text' | 'file' | 'image' | 'system' | 'announcement'
  fileUrl?: string
  fileName?: string
  fileSize?: number
  isEdited?: boolean
  replyTo?: string
  reactions?: { emoji: string; users: string[]; count: number }[]
  status: 'sending' | 'sent' | 'delivered' | 'read'
}

interface GroupMember {
  id: string
  name: string
  avatar: string
  role: 'owner' | 'moderator' | 'member'
  status: 'online' | 'away' | 'offline'
  lastSeen?: string
}

interface GroupInfo {
  id: string
  name: string
  description: string
  avatar: string
  memberCount: number
  createdAt: string
  isPrivate: boolean
  settings: {
    allowFileSharing: boolean
    allowVoiceMessages: boolean
    muteNotifications: boolean
    pinned: boolean
  }
}

export const ChatPage: React.FC = () => {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { success, error, info } = useToast()
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null)
  const [editingMessage, setEditingMessage] = useState<string | null>(null)
  
  // UI state
  const [showGroupInfo, setShowGroupInfo] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set())
  const [isRecording, setIsRecording] = useState(false)
  
  // Group data
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null)
  const [members, setMembers] = useState<GroupMember[]>([])
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messageInputRef = useRef<HTMLTextAreaElement>(null)

  // Mock data
  useEffect(() => {
    const mockGroupInfo: GroupInfo = {
      id: groupId || '1',
      name: 'Advanced Calculus Study Circle',
      description: 'Deep dive into calculus concepts with problem-solving sessions and peer teaching.',
      avatar: '📐',
      memberCount: 15,
      createdAt: '2024-01-15',
      isPrivate: false,
      settings: {
        allowFileSharing: true,
        allowVoiceMessages: true,
        muteNotifications: false,
        pinned: true
      }
    }

    const mockMembers: GroupMember[] = [
      {
        id: '1',
        name: 'Dr. Sarah Chen',
        avatar: '👩‍🏫',
        role: 'owner',
        status: 'online'
      },
      {
        id: '2',
        name: 'Alex Rodriguez',
        avatar: '👨‍🎓',
        role: 'moderator',
        status: 'online'
      },
      {
        id: '3',
        name: 'Emma Wilson',
        avatar: '👩‍💼',
        role: 'member',
        status: 'away',
        lastSeen: '5 minutes ago'
      },
      {
        id: '4',
        name: 'Mike Johnson',
        avatar: '👨‍💻',
        role: 'member',
        status: 'offline',
        lastSeen: '2 hours ago'
      },
      {
        id: user?.id || '5',
        name: user?.user_metadata?.username || 'You',
        avatar: '👤',
        role: 'member',
        status: 'online'
      }
    ]

    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        userId: '1',
        userName: 'Dr. Sarah Chen',
        userAvatar: '👩‍🏫',
        message: 'Welcome to our study group chat! Feel free to ask questions and share resources.',
        timestamp: new Date(Date.now() - 86400000),
        type: 'announcement',
        status: 'read'
      },
      {
        id: '2',
        userId: '2',
        userName: 'Alex Rodriguez',
        userAvatar: '👨‍🎓',
        message: 'Thanks for setting this up! I have some practice problems I can share.',
        timestamp: new Date(Date.now() - 82800000),
        type: 'text',
        status: 'read'
      },
      {
        id: '3',
        userId: '3',
        userName: 'Emma Wilson',
        userAvatar: '👩‍💼',
        message: 'That would be great! I\'m struggling with integration by parts.',
        timestamp: new Date(Date.now() - 79200000),
        type: 'text',
        status: 'read'
      },
      {
        id: '4',
        userId: '2',
        userName: 'Alex Rodriguez',
        userAvatar: '👨‍🎓',
        message: 'Integration Practice Problems.pdf',
        timestamp: new Date(Date.now() - 75600000),
        type: 'file',
        fileName: 'Integration Practice Problems.pdf',
        fileSize: 2048576,
        status: 'read'
      },
      {
        id: '5',
        userId: '1',
        userName: 'Dr. Sarah Chen',
        userAvatar: '👩‍🏫',
        message: 'Excellent! These problems cover all the key techniques we\'ll need for the exam.',
        timestamp: new Date(Date.now() - 72000000),
        type: 'text',
        replyTo: '4',
        status: 'read'
      },
      {
        id: '6',
        userId: '4',
        userName: 'Mike Johnson',
        userAvatar: '👨‍💻',
        message: 'Can someone explain the difference between u-substitution and integration by parts?',
        timestamp: new Date(Date.now() - 3600000),
        type: 'text',
        status: 'read'
      },
      {
        id: '7',
        userId: '1',
        userName: 'Dr. Sarah Chen',
        userAvatar: '👩‍🏫',
        message: 'Great question! U-substitution is used when you can identify a function and its derivative, while integration by parts follows the formula ∫u dv = uv - ∫v du.',
        timestamp: new Date(Date.now() - 3300000),
        type: 'text',
        replyTo: '6',
        status: 'read'
      },
      {
        id: '8',
        userId: '3',
        userName: 'Emma Wilson',
        userAvatar: '👩‍💼',
        message: 'That makes sense! Do you have any tips for choosing u and dv?',
        timestamp: new Date(Date.now() - 1800000),
        type: 'text',
        status: 'read'
      }
    ]

    setGroupInfo(mockGroupInfo)
    setMembers(mockMembers)
    setMessages(mockMessages)
  }, [groupId, user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (!newMessage.trim()) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: user?.id || 'user',
      userName: user?.user_metadata?.username || 'You',
      userAvatar: '👤',
      message: newMessage,
      timestamp: new Date(),
      type: 'text',
      replyTo: replyingTo?.id,
      status: 'sending'
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')
    setReplyingTo(null)

    // Simulate message delivery
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === message.id ? { ...msg, status: 'sent' } : msg
      ))
    }, 500)

    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === message.id ? { ...msg, status: 'delivered' } : msg
      ))
    }, 1000)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: user?.id || 'user',
      userName: user?.user_metadata?.username || 'You',
      userAvatar: '👤',
      message: file.name,
      timestamp: new Date(),
      type: file.type.startsWith('image/') ? 'image' : 'file',
      fileName: file.name,
      fileSize: file.size,
      status: 'sending'
    }

    setMessages(prev => [...prev, message])
    success('File uploaded', `${file.name} has been shared`)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf': return FileText
      case 'doc':
      case 'docx': return FileText
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return ImageIcon
      case 'mp4':
      case 'avi':
      case 'mov': return VideoIcon
      case 'mp3':
      case 'wav': return Music
      default: return File
    }
  }

  const getStatusIcon = (status: ChatMessage['status']) => {
    switch (status) {
      case 'sending': return Clock
      case 'sent': return Check
      case 'delivered': return CheckCircle
      case 'read': return CheckCircle
      default: return Clock
    }
  }

  const getStatusColor = (status: ChatMessage['status']) => {
    switch (status) {
      case 'sending': return 'text-gray-400'
      case 'sent': return 'text-gray-400'
      case 'delivered': return 'text-blue-500'
      case 'read': return 'text-green-500'
      default: return 'text-gray-400'
    }
  }

  const handleReply = (message: ChatMessage) => {
    setReplyingTo(message)
    messageInputRef.current?.focus()
  }

  const handleEdit = (messageId: string) => {
    const message = messages.find(m => m.id === messageId)
    if (message) {
      setEditingMessage(messageId)
      setNewMessage(message.message)
      messageInputRef.current?.focus()
    }
  }

  const handleDelete = (messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId))
    success('Message deleted', '')
  }

  const startVoiceCall = () => {
    info('Starting voice call...', 'Connecting to group members')
  }

  const startVideoCall = () => {
    navigate(`/session/${groupInfo?.id}`)
  }

  if (!groupInfo) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/groups')}
                className="lg:hidden"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-full flex items-center justify-center text-xl">
                  {groupInfo.avatar}
                </div>
                <div>
                  <h1 className="font-semibold text-gray-900 dark:text-white">{groupInfo.name}</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {members.filter(m => m.status === 'online').length} online • {groupInfo.memberCount} members
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={startVoiceCall}
              >
                <Phone className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={startVideoCall}
              >
                <Video className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGroupInfo(!showGroupInfo)}
              >
                <Info className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="mt-4">
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => {
            const isOwn = message.userId === user?.id
            const replyMessage = message.replyTo ? messages.find(m => m.id === message.replyTo) : null
            const StatusIcon = getStatusIcon(message.status)

            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}
              >
                <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                  {/* Reply indicator */}
                  {replyMessage && (
                    <div className="mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg border-l-4 border-primary-500">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Replying to {replyMessage.userName}
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {replyMessage.message}
                      </div>
                    </div>
                  )}

                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      message.type === 'announcement'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                        : message.type === 'system'
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        : isOwn
                        ? 'bg-primary-600 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    {/* Message header for non-own messages */}
                    {!isOwn && message.type !== 'system' && (
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-medium">{message.userName}</span>
                        {members.find(m => m.id === message.userId)?.role === 'owner' && (
                          <Crown className="w-3 h-3 text-yellow-500" />
                        )}
                        {members.find(m => m.id === message.userId)?.role === 'moderator' && (
                          <Shield className="w-3 h-3 text-blue-500" />
                        )}
                      </div>
                    )}

                    {/* Message content */}
                    {message.type === 'text' || message.type === 'announcement' || message.type === 'system' ? (
                      <p className="text-sm">{message.message}</p>
                    ) : message.type === 'file' ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                          {React.createElement(getFileIcon(message.fileName || ''), { 
                            className: "w-5 h-5 text-gray-600 dark:text-gray-400" 
                          })}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{message.fileName}</p>
                          <p className="text-xs opacity-75">
                            {message.fileSize ? formatFileSize(message.fileSize) : 'Unknown size'}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : message.type === 'image' ? (
                      <div>
                        <div className="w-48 h-32 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center mb-2">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-xs opacity-75">{message.fileName}</p>
                      </div>
                    ) : null}

                    {/* Message footer */}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs opacity-75">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {message.isEdited && ' (edited)'}
                      </span>
                      {isOwn && (
                        <StatusIcon className={`w-3 h-3 ${getStatusColor(message.status)}`} />
                      )}
                    </div>
                  </div>

                  {/* Message actions */}
                  <div className={`mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                    isOwn ? 'text-right' : 'text-left'
                  }`}>
                    <div className="inline-flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReply(message)}
                        className="h-6 px-2 text-xs"
                      >
                        <Reply className="w-3 h-3" />
                      </Button>
                      {isOwn && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(message.id)}
                            className="h-6 px-2 text-xs"
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(message.id)}
                            className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Avatar for non-own messages */}
                {!isOwn && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm mr-3 order-1">
                    {message.userAvatar}
                  </div>
                )}
              </div>
            )
          })}

          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm">
                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Reply indicator */}
        {replyingTo && (
          <div className="px-6 py-2 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Reply className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-blue-800 dark:text-blue-200">
                  Replying to {replyingTo.userName}
                </span>
                <span className="text-sm text-blue-600 dark:text-blue-400 truncate max-w-xs">
                  {replyingTo.message}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-end space-x-3">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileUpload}
            />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="w-4 h-4" />
            </Button>

            <div className="flex-1">
              <textarea
                ref={messageInputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                placeholder="Type a message..."
                rows={1}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none dark:bg-gray-700 dark:text-white"
                style={{ minHeight: '40px', maxHeight: '120px' }}
              />
            </div>

            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="h-10"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Group Info Sidebar */}
      {showGroupInfo && (
        <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-6">
            {/* Group Header */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                {groupInfo.avatar}
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {groupInfo.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {groupInfo.description}
              </p>
            </div>

            {/* Group Actions */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Button variant="outline" onClick={startVoiceCall}>
                <Phone className="w-4 h-4 mr-2" />
                Call
              </Button>
              <Button variant="outline" onClick={startVideoCall}>
                <Video className="w-4 h-4 mr-2" />
                Video
              </Button>
            </div>

            {/* Group Stats */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Members</span>
                <span className="font-medium dark:text-white">{groupInfo.memberCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Created</span>
                <span className="font-medium dark:text-white">
                  {new Date(groupInfo.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Privacy</span>
                <span className="font-medium dark:text-white">
                  {groupInfo.isPrivate ? 'Private' : 'Public'}
                </span>
              </div>
            </div>

            {/* Members List */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">Members</h3>
                <Button variant="ghost" size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-3">
                {members.slice(0, 5).map((member) => (
                  <div key={member.id} className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm">
                        {member.avatar}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                        member.status === 'online' ? 'bg-green-500' :
                        member.status === 'away' ? 'bg-yellow-500' :
                        'bg-gray-400'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 dark:text-white truncate">
                          {member.name}
                        </span>
                        {member.role === 'owner' && <Crown className="w-3 h-3 text-yellow-500" />}
                        {member.role === 'moderator' && <Shield className="w-3 h-3 text-blue-500" />}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {member.status === 'online' ? 'Online' :
                         member.status === 'away' ? 'Away' :
                         `Last seen ${member.lastSeen}`}
                      </p>
                    </div>
                  </div>
                ))}
                {members.length > 5 && (
                  <Button variant="ghost" className="w-full text-sm">
                    View all {members.length} members
                  </Button>
                )}
              </div>
            </div>

            {/* Settings */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Settings</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-gray-700 dark:text-gray-300">Notifications</span>
                  <input
                    type="checkbox"
                    checked={!groupInfo.settings.muteNotifications}
                    onChange={() => {}}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-gray-700 dark:text-gray-300">Pin Chat</span>
                  <input
                    type="checkbox"
                    checked={groupInfo.settings.pinned}
                    onChange={() => {}}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}