import React, { useState, useRef, useCallback } from 'react'
import { Upload, FileText, Image, File, X, Eye, Download, Sparkles, Brain, BookOpen, CheckCircle, AlertCircle, Loader2, Plus, Trash2, FileImage, File as FilePdf, FileType, Zap, Target, Clock, BarChart3 } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { geminiService } from '../lib/gemini'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { supabase } from '../lib/supabase'

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
  }
  error?: string
}

interface ProcessingOptions {
  generateSummary: boolean
  extractKeyTopics: boolean
  createQuestions: boolean
  generateFlashcards: boolean
  assessDifficulty: boolean
}

export const UploadPage: React.FC = () => {
  const { user } = useAuth()
  const { success, error, info } = useToast()
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [processingOptions, setProcessingOptions] = useState<ProcessingOptions>({
    generateSummary: true,
    extractKeyTopics: true,
    createQuestions: true,
    generateFlashcards: false,
    assessDifficulty: true
  })
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
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

  const processFile = async (fileId: string, file: File) => {
    try {
      setIsProcessing(true)
      
      // Extract text content based on file type
      let extractedText = ''
      
      if (file.type === 'text/plain') {
        extractedText = await file.text()
      } else if (file.type === 'application/pdf') {
        // For demo purposes, we'll simulate PDF text extraction
        extractedText = `This is extracted text from ${file.name}. In a real implementation, you would use a PDF parsing library like pdf-parse or PDF.js to extract the actual text content.`
      } else if (file.type.startsWith('image/')) {
        // For images, we'll use a placeholder - in reality you'd use OCR
        extractedText = `Image content from ${file.name}. In a real implementation, you would use OCR services like Google Vision API or Tesseract.js to extract text from images.`
      }

      // Generate AI analysis
      const analysis = await generateAnalysis(extractedText, processingOptions)
      
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId ? { 
          ...f, 
          status: 'completed', 
          analysis: { ...analysis, extractedText }
        } : f
      ))

      // Save to database (placeholder)
      await saveToDatabase(fileId, file, analysis)
      
      success('File processed successfully', `${file.name} has been analyzed and is ready for study`)
      
    } catch (error) {
      console.error('Error processing file:', error)
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

  const generateAnalysis = async (text: string, options: ProcessingOptions) => {
    const analysisPrompts = []
    
    if (options.generateSummary) {
      analysisPrompts.push('Generate a concise summary of the main points')
    }
    if (options.extractKeyTopics) {
      analysisPrompts.push('Extract 5-7 key topics or concepts')
    }
    if (options.createQuestions) {
      analysisPrompts.push('Create 3-5 study questions based on the content')
    }
    if (options.assessDifficulty) {
      analysisPrompts.push('Assess the difficulty level (Beginner/Intermediate/Advanced)')
    }

    const prompt = `
    Analyze the following text and provide:
    ${analysisPrompts.join(', ')}
    
    Text: ${text.substring(0, 2000)}...
    
    Please format your response as JSON with the following structure:
    {
      "summary": "Brief summary here",
      "keyTopics": ["topic1", "topic2", "topic3"],
      "difficulty": "Beginner|Intermediate|Advanced",
      "estimatedReadTime": "X minutes",
      "suggestedQuestions": ["question1", "question2", "question3"]
    }
    `

    try {
      const response = await geminiService.generateStudyBuddyResponse(
        prompt,
        { 
          id: 'professor-synapse',
          name: 'Professor Synapse',
          description: 'Academic analyzer',
          avatar: '👨‍🏫',
          personality: 'Analytical and thorough',
          systemPrompt: 'You are an expert academic content analyzer. Provide detailed, accurate analysis of educational materials.'
        }
      )

      // Try to parse JSON response, fallback to manual parsing if needed
      try {
        return JSON.parse(response)
      } catch {
        // Fallback parsing if AI doesn't return valid JSON
        return {
          summary: response.substring(0, 200) + '...',
          keyTopics: ['Content Analysis', 'Study Material', 'Educational Content'],
          difficulty: 'Intermediate' as const,
          estimatedReadTime: '5-10 minutes',
          suggestedQuestions: [
            'What are the main concepts covered?',
            'How does this relate to previous topics?',
            'What are the practical applications?'
          ]
        }
      }
    } catch (error) {
      console.error('Error generating analysis:', error)
      return {
        summary: 'Analysis temporarily unavailable. Please try again.',
        keyTopics: ['Content uploaded successfully'],
        difficulty: 'Intermediate' as const,
        estimatedReadTime: 'Unknown',
        suggestedQuestions: ['Content will be analyzed shortly.']
      }
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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-white dark:from-primary-700 dark:to-secondary-700">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Upload Content</h1>
            <p className="text-primary-100">Upload documents and let AI analyze them for enhanced learning</p>
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
              {Object.entries(processingOptions).map(([key, value]) => (
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
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                </label>
              ))}
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedFile(uploadedFile)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
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
                      Study Questions
                    </h4>
                    <ul className="space-y-1">
                      {selectedFile.analysis.suggestedQuestions.map((question, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                          • {question}
                        </li>
                      ))}
                    </ul>
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
        </div>
      </div>
    </div>
  )
}