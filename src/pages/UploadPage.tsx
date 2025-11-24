import React, { useState, useRef, useCallback } from 'react'
import { Upload, FileText, Image, File, X, Eye, Download, Sparkles, Brain, BookOpen, CheckCircle, AlertCircle, Loader2, Plus, Trash2, FileImage, File as FilePdf, FileType, Zap, Target, Clock, BarChart3, MessageSquare, ArrowRight, ArrowLeft, RotateCcw, Award } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { geminiService } from '../lib/gemini'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

interface UploadedFile {
  id: string
  file: File
  preview?: string
  status: 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  analysis?: {
    summary: string
    keyTopics: string[]
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
    estimatedReadTime: string
    suggestedQuestions: string[]
    extractedText?: string
    wordCount?: number
    language?: string
  }
  flashcards?: Array<{
    id: string
    front: string
    back: string
    category: string
  }>
  error?: string
}

interface ProcessingOptions {
  generateSummary: boolean
  extractKeyTopics: boolean
  createQuestions: boolean
  generateFlashcards: boolean
  assessDifficulty: boolean
}

interface QuestionSession {
  fileId: string
  questions: Array<{
    id: string
    question: string
    userAnswer: string
    correctAnswer: string
    isCorrect?: boolean
    explanation?: string
  }>
  currentQuestionIndex: number
  score: number
  isCompleted: boolean
}

interface FlashcardSession {
  fileId: string
  cards: Array<{
    id: string
    front: string
    back: string
    category: string
    isFlipped: boolean
    difficulty: 'easy' | 'medium' | 'hard'
    lastReviewed?: Date
  }>
  currentCardIndex: number
  showBack: boolean
  studyMode: 'review' | 'quiz'
}

export const UploadPage: React.FC = () => {
  const { user } = useAuth() // user is used in logic although not explicitly in this snippet
  // Keeping user for auth check context if needed in future
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _user = user;

  const { success, error, info } = useToast()
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [processingOptions, setProcessingOptions] = useState<ProcessingOptions>({
    generateSummary: true,
    extractKeyTopics: true,
    createQuestions: true,
    generateFlashcards: true,
    assessDifficulty: true
  })
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeView, setActiveView] = useState<'upload' | 'analysis' | 'questions' | 'flashcards'>('upload')
  const [questionSession, setQuestionSession] = useState<QuestionSession | null>(null)
  const [flashcardSession, setFlashcardSession] = useState<FlashcardSession | null>(null)
  const [currentAnswer, setCurrentAnswer] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = async (files: File[]) => {
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'text/plain', 'image/jpeg', 'image/png', 'image/gif']
      const isValidType = validTypes.includes(file.type)
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB limit
      
      if (!isValidType) {
        error('Invalid file type', `${file.name} is not a supported file type`)
        return false
      }
      
      if (!isValidSize) {
        error('File too large', `${file.name} exceeds the 10MB size limit`)
        return false
      }
      
      return true
    })

    if (validFiles.length === 0) return

    info('Upload started', `Processing ${validFiles.length} file${validFiles.length > 1 ? 's' : ''}`)

    for (const file of validFiles) {
      const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
      const newFile: UploadedFile = {
        id: fileId,
        file,
        status: 'uploading',
        progress: 0
      }

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setUploadedFiles(prev => prev.map(f => 
            f.id === fileId ? { ...f, preview: e.target?.result as string } : f
          ))
        }
        reader.readAsDataURL(file)
      }

      setUploadedFiles(prev => [...prev, newFile])
      
      // Simulate upload progress
      await simulateUpload(fileId)
      
      // Process the file
      await processFile(fileId, file)
    }
  }

  const simulateUpload = async (fileId: string) => {
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 100))
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, progress } : f
      ))
    }
    
    setUploadedFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: 'processing' } : f
    ))
  }

  const extractTextFromFile = async (file: File): Promise<string> => {
    if (file.type === 'text/plain') {
      return await file.text()
    } else if (file.type === 'application/pdf') {
      // For demo purposes, simulate PDF text extraction
      return `This is extracted text from ${file.name}. In a real implementation, you would use a PDF parsing library like pdf-parse or PDF.js to extract the actual text content. This document contains important information about the subject matter that can be analyzed by AI to generate summaries, questions, and flashcards.`
    } else if (file.type.startsWith('image/')) {
      // For images, simulate OCR
      return `Image content from ${file.name}. In a real implementation, you would use OCR services like Google Vision API or Tesseract.js to extract text from images. This image contains educational content that can be processed for learning purposes.`
    }
    return ''
  }

  const processFile = async (fileId: string, file: File) => {
    try {
      setIsProcessing(true)
      
      // Extract text content
      const extractedText = await extractTextFromFile(file)
      const wordCount = extractedText.split(/\s+/).length
      
      // Generate AI analysis using Gemini
      const analysis = await geminiService.analyzeDocument(extractedText, {
        generateSummary: processingOptions.generateSummary,
        extractKeyTopics: processingOptions.extractKeyTopics,
        createQuestions: processingOptions.createQuestions,
        assessDifficulty: processingOptions.assessDifficulty
      })

      // Generate flashcards if requested
      let flashcards: any[] = []
      if (processingOptions.generateFlashcards) {
        try {
          flashcards = await geminiService.generateFlashcards(extractedText, 8)
        } catch (flashcardError) {
          console.error('Error generating flashcards:', flashcardError)
          // Continue without flashcards if generation fails
        }
      }
      
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId ? { 
          ...f, 
          status: 'completed', 
          analysis: { 
            ...analysis, 
            extractedText,
            wordCount,
            language: 'English' // Could be detected by AI
          },
          flashcards: flashcards.map(card => ({
            ...card,
            id: card.id || Math.random().toString(36).substr(2, 9)
          }))
        } : f
      ))

      // Save to database (placeholder)
      await saveToDatabase(fileId, file, analysis)
      
      success('File processed successfully', `${file.name} has been analyzed and is ready for study`)
      
    } catch (err) {
      console.error('Error processing file:', err)
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId ? { 
          ...f, 
          status: 'error', 
          error: 'Failed to process file'
        } : f
      ))
      
      error('Processing failed', `Failed to analyze ${file.name}. Please try again.`)
    } finally {
      setIsProcessing(false)
    }
  }

  const saveToDatabase = async (fileId: string, file: File, analysis: any) => {
    // Placeholder for database saving
    console.log('Saving to database:', { fileId, fileName: file.name, analysis })
  }

  const removeFile = (fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId)
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
    if (selectedFile?.id === fileId) {
      setSelectedFile(null)
    }
    
    if (file) {
      success('File removed', `${file.file.name} has been removed from your uploads`)
    }
  }

  const startQuestionSession = (file: UploadedFile) => {
    if (!file.analysis?.suggestedQuestions) return

    const questions = file.analysis.suggestedQuestions.map((q, index) => ({
      id: `q${index + 1}`,
      question: q,
      userAnswer: '',
      correctAnswer: '', // Would be generated by AI in real implementation
      explanation: 'This question tests your understanding of the key concepts in the document.'
    }))

    setQuestionSession({
      fileId: file.id,
      questions,
      currentQuestionIndex: 0,
      score: 0,
      isCompleted: false
    })
    setActiveView('questions')
  }

  const startFlashcardSession = (file: UploadedFile) => {
    if (!file.flashcards) return

    const cards = file.flashcards.map(card => ({
      ...card,
      isFlipped: false,
      difficulty: 'medium' as const,
      lastReviewed: new Date()
    }))

    setFlashcardSession({
      fileId: file.id,
      cards,
      currentCardIndex: 0,
      showBack: false,
      studyMode: 'review'
    })
    setActiveView('flashcards')
  }

  const submitAnswer = () => {
    if (!questionSession || !currentAnswer.trim()) return

    const updatedQuestions = [...questionSession.questions]
    updatedQuestions[questionSession.currentQuestionIndex] = {
      ...updatedQuestions[questionSession.currentQuestionIndex],
      userAnswer: currentAnswer,
      isCorrect: true // Would be evaluated by AI in real implementation
    }

    setQuestionSession({
      ...questionSession,
      questions: updatedQuestions,
      score: questionSession.score + 1
    })

    setCurrentAnswer('')
    
    if (questionSession.currentQuestionIndex < questionSession.questions.length - 1) {
      setQuestionSession(prev => prev ? {
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      } : null)
    } else {
      setQuestionSession(prev => prev ? {
        ...prev,
        isCompleted: true
      } : null)
      success('Session completed!', `You scored ${questionSession.score + 1}/${questionSession.questions.length}`)
    }
  }

  const nextCard = () => {
    if (!flashcardSession) return
    
    if (flashcardSession.currentCardIndex < flashcardSession.cards.length - 1) {
      setFlashcardSession({
        ...flashcardSession,
        currentCardIndex: flashcardSession.currentCardIndex + 1,
        showBack: false
      })
    }
  }

  const prevCard = () => {
    if (!flashcardSession) return
    
    if (flashcardSession.currentCardIndex > 0) {
      setFlashcardSession({
        ...flashcardSession,
        currentCardIndex: flashcardSession.currentCardIndex - 1,
        showBack: false
      })
    }
  }

  const flipCard = () => {
    if (!flashcardSession) return
    
    setFlashcardSession({
      ...flashcardSession,
      showBack: !flashcardSession.showBack
    })
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return FileImage
    if (file.type === 'application/pdf') return FilePdf
    if (file.type === 'text/plain') return FileText
    return FileType
  }

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading': return 'text-blue-600'
      case 'processing': return 'text-yellow-600'
      case 'completed': return 'text-green-600'
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading': return Loader2
      case 'processing': return Brain
      case 'completed': return CheckCircle
      case 'error': return AlertCircle
      default: return File
    }
  }

  // Question Session View
  if (activeView === 'questions' && questionSession) {
    const currentQuestion = questionSession.questions[questionSession.currentQuestionIndex]
    const progress = ((questionSession.currentQuestionIndex + 1) / questionSession.questions.length) * 100

    return (
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Study Questions</h1>
                <p className="text-blue-100">Answer questions based on your uploaded content</p>
              </div>
            </div>
            <Button
              onClick={() => setActiveView('upload')}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Upload
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Question {questionSession.currentQuestionIndex + 1} of {questionSession.questions.length}
            </h3>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Score: {questionSession.score}/{questionSession.questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        {!questionSession.isCompleted ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              {currentQuestion.question}
            </h2>
            
            <div className="space-y-4">
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your answer here..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (questionSession.currentQuestionIndex > 0) {
                      setQuestionSession({
                        ...questionSession,
                        currentQuestionIndex: questionSession.currentQuestionIndex - 1
                      })
                    }
                  }}
                  disabled={questionSession.currentQuestionIndex === 0}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                
                <Button
                  onClick={submitAnswer}
                  disabled={!currentAnswer.trim()}
                >
                  {questionSession.currentQuestionIndex === questionSession.questions.length - 1 ? 'Finish' : 'Next'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Session Complete!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You scored {questionSession.score}/{questionSession.questions.length} questions correctly
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                onClick={() => setActiveView('upload')}
                variant="outline"
              >
                Back to Upload
              </Button>
              <Button
                onClick={() => {
                  setQuestionSession({
                    ...questionSession,
                    currentQuestionIndex: 0,
                    score: 0,
                    isCompleted: false,
                    questions: questionSession.questions.map(q => ({ ...q, userAnswer: '', isCorrect: undefined }))
                  })
                  setCurrentAnswer('')
                }}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Flashcard Session View
  if (activeView === 'flashcards' && flashcardSession) {
    const currentCard = flashcardSession.cards[flashcardSession.currentCardIndex]
    const progress = ((flashcardSession.currentCardIndex + 1) / flashcardSession.cards.length) * 100

    return (
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Flashcards</h1>
                <p className="text-purple-100">Study with AI-generated flashcards</p>
              </div>
            </div>
            <Button
              onClick={() => setActiveView('upload')}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Upload
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Card {flashcardSession.currentCardIndex + 1} of {flashcardSession.cards.length}
            </h3>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Category: {currentCard.category}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Flashcard */}
        <div className="flex justify-center">
          <div 
            className="w-full max-w-2xl h-80 relative cursor-pointer"
            onClick={flipCard}
          >
            <div className={`absolute inset-0 w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
              flashcardSession.showBack ? 'rotate-y-180' : ''
            }`}>
              {/* Front */}
              <div className="absolute inset-0 w-full h-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-600 backface-hidden">
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="mb-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">Question</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                    {currentCard.front}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Click to reveal answer
                  </p>
                </div>
              </div>

              {/* Back */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-xl rotate-y-180 backface-hidden">
                <div className="flex flex-col items-center justify-center h-full p-8 text-center text-white">
                  <div className="mb-4">
                    <span className="text-sm text-purple-200 uppercase tracking-wide">Answer</span>
                  </div>
                  <h2 className="text-2xl font-semibold mb-6">
                    {currentCard.back}
                  </h2>
                  <p className="text-purple-200 text-sm">
                    Click to flip back
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            onClick={prevCard}
            disabled={flashcardSession.currentCardIndex === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <Button
            onClick={flipCard}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {flashcardSession.showBack ? 'Show Question' : 'Show Answer'}
          </Button>
          
          <Button
            variant="outline"
            onClick={nextCard}
            disabled={flashcardSession.currentCardIndex === flashcardSession.cards.length - 1}
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Difficulty Rating */}
        {flashcardSession.showBack && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
              How difficult was this card?
            </h3>
            <div className="flex justify-center space-x-4">
              {['easy', 'medium', 'hard'].map((difficulty) => (
                <Button
                  key={difficulty}
                  variant="outline"
                  onClick={() => {
                    // Update card difficulty and move to next
                    const updatedCards = [...flashcardSession.cards]
                    updatedCards[flashcardSession.currentCardIndex] = {
                      ...updatedCards[flashcardSession.currentCardIndex],
                      difficulty: difficulty as 'easy' | 'medium' | 'hard',
                      lastReviewed: new Date()
                    }
                    setFlashcardSession({
                      ...flashcardSession,
                      cards: updatedCards
                    })
                    nextCard()
                  }}
                  className={`capitalize ${
                    difficulty === 'easy' ? 'text-green-600 border-green-300 hover:bg-green-50' :
                    difficulty === 'medium' ? 'text-yellow-600 border-yellow-300 hover:bg-yellow-50' :
                    'text-red-600 border-red-300 hover:bg-red-50'
                  }`}
                >
                  {difficulty}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Main Upload View
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-white dark:from-primary-700 dark:to-secondary-700">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI-Powered Content Analysis</h1>
            <p className="text-primary-100">Upload documents and let advanced AI analyze them for enhanced learning</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Processing Options */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-primary-600" />
              AI Processing Options
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(processingOptions).map(([key, value]) => {
                const labels = {
                  generateSummary: 'Generate Summary',
                  extractKeyTopics: 'Extract Key Topics',
                  createQuestions: 'Create Study Questions',
                  generateFlashcards: 'Generate Flashcards',
                  assessDifficulty: 'Assess Difficulty'
                }
                
                return (
                  <label key={key} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setProcessingOptions(prev => ({
                        ...prev,
                        [key]: e.target.checked
                      }))}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {labels[key as keyof typeof labels]}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Upload Area */}
          <div
            className={`
              relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300
              ${dragActive 
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.txt,.jpg,.jpeg,.png,.gif"
              onChange={handleFileInput}
              className="hidden"
            />
            
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto">
                <Upload className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Drop files here or click to upload
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Support for PDF, TXT, and image files (max 10MB each)
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="mx-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Choose Files
                </Button>
              </div>
            </div>
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Uploaded Files</h3>
              <div className="space-y-4">
                {uploadedFiles.map((uploadedFile) => {
                  const FileIcon = getFileIcon(uploadedFile.file)
                  const StatusIcon = getStatusIcon(uploadedFile.status)
                  
                  return (
                    <div
                      key={uploadedFile.id}
                      className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <FileIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {uploadedFile.file.name}
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          <span>{(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB</span>
                          <span>•</span>
                          <span className={getStatusColor(uploadedFile.status)}>
                            {uploadedFile.status}
                          </span>
                        </div>
                        
                        {uploadedFile.status === 'uploading' && (
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                            <div 
                              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadedFile.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <StatusIcon className={`w-5 h-5 ${getStatusColor(uploadedFile.status)} ${
                          uploadedFile.status === 'uploading' || uploadedFile.status === 'processing' 
                            ? 'animate-spin' : ''
                        }`} />
                        
                        {uploadedFile.status === 'completed' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedFile(uploadedFile)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            
                            {uploadedFile.analysis?.suggestedQuestions && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startQuestionSession(uploadedFile)}
                                title="Answer Questions"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </Button>
                            )}
                            
                            {uploadedFile.flashcards && uploadedFile.flashcards.length > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startFlashcardSession(uploadedFile)}
                                title="Study Flashcards"
                              >
                                <BookOpen className="w-4 h-4" />
                              </Button>
                            )}
                          </>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(uploadedFile.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Analysis Panel */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upload Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Files</span>
                <span className="font-semibold dark:text-white">{uploadedFiles.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Completed</span>
                <span className="font-semibold text-green-600">
                  {uploadedFiles.filter(f => f.status === 'completed').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Processing</span>
                <span className="font-semibold text-yellow-600">
                  {uploadedFiles.filter(f => f.status === 'processing' || f.status === 'uploading').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">With Flashcards</span>
                <span className="font-semibold text-purple-600">
                  {uploadedFiles.filter(f => f.flashcards && f.flashcards.length > 0).length}
                </span>
              </div>
            </div>
          </div>

          {/* File Analysis */}
          {selectedFile && selectedFile.analysis && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analysis Results</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">File</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedFile.file.name}</p>
                </div>
                
                {selectedFile.analysis.summary && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Summary
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedFile.analysis.summary}</p>
                  </div>
                )}
                
                {selectedFile.analysis.keyTopics && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                      <Target className="w-4 h-4 mr-2" />
                      Key Topics
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedFile.analysis.keyTopics.map((topic, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1 flex items-center">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Difficulty
                    </h4>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      selectedFile.analysis.difficulty === 'Beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                      selectedFile.analysis.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {selectedFile.analysis.difficulty}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1 flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Read Time
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedFile.analysis.estimatedReadTime}</p>
                  </div>
                </div>
                
                {selectedFile.analysis.suggestedQuestions && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                      <Zap className="w-4 h-4 mr-2" />
                      Study Questions ({selectedFile.analysis.suggestedQuestions.length})
                    </h4>
                    <Button
                      onClick={() => startQuestionSession(selectedFile)}
                      size="sm"
                      className="w-full"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Start Question Session
                    </Button>
                  </div>
                )}

                {selectedFile.flashcards && selectedFile.flashcards.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Flashcards ({selectedFile.flashcards.length})
                    </h4>
                    <Button
                      onClick={() => startFlashcardSession(selectedFile)}
                      size="sm"
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Study Flashcards
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Processing Status */}
          {isProcessing && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center space-x-3">
                <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Processing Files</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">AI is analyzing your content...</p>
                </div>
              </div>
            </div>
          )}

          {/* AI Features Info */}
          <div className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl p-6 border border-primary-200 dark:border-primary-800">
            <h3 className="font-semibold text-primary-900 dark:text-primary-200 mb-3 flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              AI-Powered Features
            </h3>
            <ul className="space-y-2 text-sm text-primary-700 dark:text-primary-300">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Intelligent document summarization</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Automatic key topic extraction</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Interactive study questions</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Smart flashcard generation</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Difficulty level assessment</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
