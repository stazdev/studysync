import React, { useState, useEffect } from 'react'
import { 
  Brain, 
  Clock, 
  Target, 
  CheckCircle, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  Trophy, 
  Star, 
  Zap, 
  BookOpen, 
  Play, 
  Pause, 
  SkipForward,
  AlertCircle,
  Award,
  TrendingUp,
  Users,
  Share2,
  Download,
  Eye,
  Settings,
  Shuffle,
  Timer,
  HelpCircle,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  MessageSquare
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { geminiService } from '../lib/gemini'

interface Question {
  id: string
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'short-answer'
  question: string
  options?: string[]
  correctAnswer: string | number
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
  topic: string
  points: number
}

interface QuizResult {
  score: number
  totalQuestions: number
  timeSpent: number
  correctAnswers: number
  incorrectAnswers: number
  skippedAnswers: number
  accuracy: number
  questionResults: {
    questionId: string
    userAnswer: string | number | null
    isCorrect: boolean
    timeSpent: number
  }[]
}

interface QuizSettings {
  subject: string
  difficulty: 'mixed' | 'easy' | 'medium' | 'hard'
  questionCount: number
  timeLimit: number // in minutes, 0 = no limit
  questionTypes: string[]
  randomOrder: boolean
}

export const QuizPage: React.FC = () => {
  const { user } = useAuth()
  const { success, error, info } = useToast()
  
  // Quiz state
  const [quizState, setQuizState] = useState<'setup' | 'taking' | 'completed' | 'review'>('setup')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Map<string, string | number>>(new Map())
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [timeSpent, setTimeSpent] = useState(0)
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null)
  const [questionStartTime, setQuestionStartTime] = useState<Date | null>(null)
  const [isTimerPaused, setIsTimerPaused] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [loading, setLoading] = useState(false)
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null)

  // Quiz settings
  const [quizSettings, setQuizSettings] = useState<QuizSettings>({
    subject: 'Mathematics',
    difficulty: 'mixed',
    questionCount: 10,
    timeLimit: 15,
    questionTypes: ['multiple-choice', 'true-false'],
    randomOrder: true
  })

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'History', 'Literature', 'Psychology', 'Economics', 'Geography'
  ]

  const questionTypes = [
    { id: 'multiple-choice', label: 'Multiple Choice', icon: Target },
    { id: 'true-false', label: 'True/False', icon: CheckCircle },
    { id: 'fill-blank', label: 'Fill in the Blank', icon: BookOpen },
    { id: 'short-answer', label: 'Short Answer', icon: MessageSquare }
  ]

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (quizState === 'taking' && !isTimerPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleQuizComplete()
            return 0
          }
          return prev - 1
        })
        setTimeSpent(prev => prev + 1)
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [quizState, isTimerPaused, timeRemaining])

  const generateQuiz = async () => {
    setLoading(true)
    try {
      const prompt = `Generate ${quizSettings.questionCount} quiz questions about ${quizSettings.subject} with the following specifications:
      
      - Difficulty: ${quizSettings.difficulty === 'mixed' ? 'mix of easy, medium, and hard' : quizSettings.difficulty}
      - Question types: ${quizSettings.questionTypes.join(', ')}
      - Each question should have:
        * A clear, well-formed question
        * For multiple choice: 4 options with one correct answer
        * For true/false: a statement that can be clearly true or false
        * For fill-blank: a sentence with one blank to fill
        * For short-answer: a question requiring a brief response
        * An explanation of the correct answer
        * A difficulty level (easy/medium/hard)
        * A specific topic within ${quizSettings.subject}
        * Point value (easy: 1, medium: 2, hard: 3)
      
      Format as JSON array with this structure:
      [
        {
          "id": "unique_id",
          "type": "multiple-choice|true-false|fill-blank|short-answer",
          "question": "Question text",
          "options": ["option1", "option2", "option3", "option4"] (for multiple choice only),
          "correctAnswer": "correct answer or option index",
          "explanation": "Why this is correct",
          "difficulty": "easy|medium|hard",
          "topic": "specific topic",
          "points": 1-3
        }
      ]`

      const response = await geminiService.generateStudyBuddyResponse(
        prompt,
        {
          id: 'professor-synapse',
          name: 'Professor Synapse',
          description: 'Quiz generator',
          avatar: '👨‍🏫',
          personality: 'Academic and precise',
          systemPrompt: 'You are an expert quiz generator. Create high-quality, educational quiz questions that test understanding and knowledge effectively.'
        }
      )

      try {
        const generatedQuestions = JSON.parse(response)
        const processedQuestions = generatedQuestions.map((q: any, index: number) => ({
          ...q,
          id: q.id || `q_${index + 1}`,
          points: q.points || (q.difficulty === 'easy' ? 1 : q.difficulty === 'medium' ? 2 : 3)
        }))

        if (quizSettings.randomOrder) {
          processedQuestions.sort(() => Math.random() - 0.5)
        }

        setQuestions(processedQuestions)
        setQuizState('taking')
        setQuizStartTime(new Date())
        setQuestionStartTime(new Date())
        setTimeRemaining(quizSettings.timeLimit * 60)
        setCurrentQuestionIndex(0)
        setUserAnswers(new Map())
        
        success('Quiz generated!', `${processedQuestions.length} questions ready`)
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError)
        // Fallback with sample questions
        const fallbackQuestions = generateFallbackQuestions()
        setQuestions(fallbackQuestions)
        setQuizState('taking')
        setQuizStartTime(new Date())
        setQuestionStartTime(new Date())
        setTimeRemaining(quizSettings.timeLimit * 60)
        info('Using sample questions', 'AI generation failed, using sample quiz')
      }
    } catch (err) {
      console.error('Error generating quiz:', err)
      error('Failed to generate quiz', 'Please try again')
    } finally {
      setLoading(false)
    }
  }

  const generateFallbackQuestions = (): Question[] => {
    return [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'What is the derivative of x²?',
        options: ['2x', 'x', '2', 'x²'],
        correctAnswer: 0,
        explanation: 'Using the power rule: d/dx(x²) = 2x¹ = 2x',
        difficulty: 'easy',
        topic: 'Calculus',
        points: 1
      },
      {
        id: 'q2',
        type: 'true-false',
        question: 'The square root of 16 is 4.',
        correctAnswer: 'true',
        explanation: '4 × 4 = 16, so √16 = 4',
        difficulty: 'easy',
        topic: 'Algebra',
        points: 1
      }
    ]
  }

  const handleAnswerSelect = (answer: string | number) => {
    const currentQuestion = questions[currentQuestionIndex]
    setUserAnswers(prev => new Map(prev.set(currentQuestion.id, answer)))
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setQuestionStartTime(new Date())
      setShowHint(false)
    } else {
      handleQuizComplete()
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
      setQuestionStartTime(new Date())
      setShowHint(false)
    }
  }

  const handleQuizComplete = () => {
    const endTime = new Date()
    const totalTimeSpent = quizStartTime ? Math.floor((endTime.getTime() - quizStartTime.getTime()) / 1000) : timeSpent

    let score = 0
    let correctCount = 0
    let incorrectCount = 0
    let skippedCount = 0

    const questionResults = questions.map(question => {
      const userAnswer = userAnswers.get(question.id)
      const isCorrect = userAnswer !== undefined && userAnswer === question.correctAnswer
      
      if (userAnswer === undefined) {
        skippedCount++
      } else if (isCorrect) {
        correctCount++
        score += question.points
      } else {
        incorrectCount++
      }

      return {
        questionId: question.id,
        userAnswer: userAnswer || null,
        isCorrect,
        timeSpent: 0 // Would track individual question time in real implementation
      }
    })

    const result: QuizResult = {
      score,
      totalQuestions: questions.length,
      timeSpent: totalTimeSpent,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      skippedAnswers: skippedCount,
      accuracy: Math.round((correctCount / questions.length) * 100),
      questionResults
    }

    setQuizResult(result)
    setQuizState('completed')
    
    // Show completion toast
    if (result.accuracy >= 80) {
      success('Excellent work!', `You scored ${result.accuracy}%`)
    } else if (result.accuracy >= 60) {
      info('Good effort!', `You scored ${result.accuracy}%`)
    } else {
      info('Keep practicing!', `You scored ${result.accuracy}%`)
    }
  }

  const resetQuiz = () => {
    setQuizState('setup')
    setQuestions([])
    setCurrentQuestionIndex(0)
    setUserAnswers(new Map())
    setTimeRemaining(0)
    setTimeSpent(0)
    setQuizStartTime(null)
    setQuestionStartTime(null)
    setIsTimerPaused(false)
    setShowHint(false)
    setQuizResult(null)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswer = currentQuestion ? userAnswers.get(currentQuestion.id) : undefined
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0

  if (quizState === 'setup') {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Take Quiz</h1>
              <p className="text-primary-100">Test your knowledge with AI-generated questions</p>
            </div>
          </div>
        </div>

        {/* Quiz Setup */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quiz Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <select
                  value={quizSettings.subject}
                  onChange={(e) => setQuizSettings(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Difficulty
                </label>
                <select
                  value={quizSettings.difficulty}
                  onChange={(e) => setQuizSettings(prev => ({ ...prev, difficulty: e.target.value as any }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="mixed">Mixed Difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Questions
                </label>
                <select
                  value={quizSettings.questionCount}
                  onChange={(e) => setQuizSettings(prev => ({ ...prev, questionCount: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                  <option value={20}>20 Questions</option>
                  <option value={25}>25 Questions</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time Limit
                </label>
                <select
                  value={quizSettings.timeLimit}
                  onChange={(e) => setQuizSettings(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value={0}>No Time Limit</option>
                  <option value={5}>5 Minutes</option>
                  <option value={10}>10 Minutes</option>
                  <option value={15}>15 Minutes</option>
                  <option value={20}>20 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Question Types
                </label>
                <div className="space-y-3">
                  {questionTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <label key={type.id} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={quizSettings.questionTypes.includes(type.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setQuizSettings(prev => ({
                                ...prev,
                                questionTypes: [...prev.questionTypes, type.id]
                              }))
                            } else {
                              setQuizSettings(prev => ({
                                ...prev,
                                questionTypes: prev.questionTypes.filter(t => t !== type.id)
                              }))
                            }
                          }}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <Icon className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700 dark:text-gray-300">{type.label}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={quizSettings.randomOrder}
                    onChange={(e) => setQuizSettings(prev => ({ ...prev, randomOrder: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <Shuffle className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">Randomize question order</span>
                </label>
              </div>

              {/* Quiz Preview */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Quiz Preview</h4>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Subject:</span>
                    <span className="font-medium">{quizSettings.subject}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Questions:</span>
                    <span className="font-medium">{quizSettings.questionCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time Limit:</span>
                    <span className="font-medium">
                      {quizSettings.timeLimit === 0 ? 'None' : `${quizSettings.timeLimit} min`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Difficulty:</span>
                    <span className="font-medium capitalize">{quizSettings.difficulty}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              onClick={generateQuiz}
              loading={loading}
              size="lg"
              className="px-8"
              disabled={quizSettings.questionTypes.length === 0}
            >
              <Play className="w-5 h-5 mr-2" />
              Generate & Start Quiz
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (quizState === 'taking') {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Quiz Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {quizSettings.subject} Quiz
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {quizSettings.timeLimit > 0 && (
                <div className="flex items-center space-x-2">
                  <Timer className={`w-5 h-5 ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-600'}`} />
                  <span className={`font-mono text-lg ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsTimerPaused(!isTimerPaused)}
              >
                {isTimerPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                    currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    {currentQuestion.difficulty}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {currentQuestion.topic}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {currentQuestion.points} point{currentQuestion.points > 1 ? 's' : ''}
                  </span>
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  {currentQuestion.question}
                </h2>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHint(!showHint)}
                className="ml-4"
              >
                <Lightbulb className="w-4 h-4" />
              </Button>
            </div>

            {/* Answer Options */}
            <div className="space-y-4">
              {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
                        currentAnswer === index
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          currentAnswer === index
                            ? 'border-primary-500 bg-primary-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {currentAnswer === index && (
                            <CheckCircle className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <span className="text-gray-900 dark:text-white">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'true-false' && (
                <div className="grid grid-cols-2 gap-4">
                  {['true', 'false'].map((option) => (
                    <button
                      key={option}
                      onClick={() => handleAnswerSelect(option)}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        currentAnswer === option
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-700'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        {option === 'true' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <X className="w-5 h-5 text-red-600" />
                        )}
                        <span className="font-medium text-gray-900 dark:text-white capitalize">
                          {option}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {(currentQuestion.type === 'fill-blank' || currentQuestion.type === 'short-answer') && (
                <div>
                  <textarea
                    value={currentAnswer as string || ''}
                    onChange={(e) => handleAnswerSelect(e.target.value)}
                    placeholder="Type your answer here..."
                    rows={currentQuestion.type === 'short-answer' ? 4 : 2}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}
            </div>

            {/* Hint */}
            {showHint && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start space-x-2">
                  <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-200">Hint</h4>
                    <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                      Think about the key concepts related to {currentQuestion.topic}. 
                      Consider the difficulty level and what you've learned about this subject.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => handleAnswerSelect('')}
                >
                  Skip
                </Button>
                
                {currentQuestionIndex === questions.length - 1 ? (
                  <Button
                    onClick={handleQuizComplete}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    Finish Quiz
                  </Button>
                ) : (
                  <Button onClick={handleNextQuestion}>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (quizState === 'completed' && quizResult) {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Results Header */}
        <div className={`rounded-2xl p-8 text-white ${
          quizResult.accuracy >= 80 ? 'bg-gradient-to-r from-green-600 to-emerald-600' :
          quizResult.accuracy >= 60 ? 'bg-gradient-to-r from-blue-600 to-indigo-600' :
          'bg-gradient-to-r from-orange-600 to-red-600'
        }`}>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              {quizResult.accuracy >= 80 ? (
                <Trophy className="w-8 h-8" />
              ) : quizResult.accuracy >= 60 ? (
                <Award className="w-8 h-8" />
              ) : (
                <Target className="w-8 h-8" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold">Quiz Complete!</h1>
              <p className="text-white/90">
                {quizResult.accuracy >= 80 ? 'Excellent work!' :
                 quizResult.accuracy >= 60 ? 'Good job!' :
                 'Keep practicing!'}
              </p>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{quizResult.score}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Score</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{quizResult.accuracy}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatTime(quizResult.timeSpent)}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Time Spent</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {quizResult.correctAnswers}/{quizResult.totalQuestions}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Correct</div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Detailed Results</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{quizResult.correctAnswers}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Correct Answers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">{quizResult.incorrectAnswers}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Incorrect Answers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">{quizResult.skippedAnswers}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Skipped Questions</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={() => setQuizState('review')}
              variant="outline"
            >
              <Eye className="w-4 h-4 mr-2" />
              Review Answers
            </Button>
            
            <Button
              onClick={resetQuiz}
              variant="outline"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Take Another Quiz
            </Button>
            
            <Button
              onClick={() => {
                // Share functionality would go here
                success('Results copied!', 'Quiz results copied to clipboard')
              }}
              variant="outline"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Results
            </Button>
            
            <Button className="bg-primary-600 hover:bg-primary-700">
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (quizState === 'review') {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Review Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Eye className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Review Answers</h1>
                <p className="text-indigo-100">See how you did on each question</p>
              </div>
            </div>
            <Button
              onClick={() => setQuizState('completed')}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
            >
              Back to Results
            </Button>
          </div>
        </div>

        {/* Question Review */}
        <div className="space-y-6">
          {questions.map((question, index) => {
            const userAnswer = userAnswers.get(question.id)
            const isCorrect = userAnswer !== undefined && userAnswer === question.correctAnswer
            const wasSkipped = userAnswer === undefined

            return (
              <div key={question.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    wasSkipped ? 'bg-gray-100 dark:bg-gray-700' :
                    isCorrect ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                  }`}>
                    {wasSkipped ? (
                      <span className="text-gray-500 font-bold">{index + 1}</span>
                    ) : isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Question {index + 1}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        question.difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                        question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {question.difficulty}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{question.topic}</span>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      {question.question}
                    </h3>
                    
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Answer: </span>
                        <span className={`${
                          wasSkipped ? 'text-gray-500 italic' :
                          isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {wasSkipped ? 'Skipped' : 
                           question.type === 'multiple-choice' && question.options ? 
                           question.options[userAnswer as number] : 
                           userAnswer}
                        </span>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Correct Answer: </span>
                        <span className="text-green-600 dark:text-green-400">
                          {question.type === 'multiple-choice' && question.options ? 
                           question.options[question.correctAnswer as number] : 
                           question.correctAnswer}
                        </span>
                      </div>
                      
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-3">
                        <span className="text-sm font-medium text-blue-900 dark:text-blue-200">Explanation: </span>
                        <span className="text-blue-700 dark:text-blue-300 text-sm">{question.explanation}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return null
}