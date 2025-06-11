import { GoogleGenerativeAI } from '@google/generative-ai'

// Check if API key is available
const apiKey = import.meta.env.VITE_GEMINI_API_KEY
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

export interface StudyBuddyPersona {
  id: string
  name: string
  description: string
  avatar: string
  personality: string
  systemPrompt: string
}

export const studyBuddyPersonas: StudyBuddyPersona[] = [
  {
    id: 'professor-synapse',
    name: 'Professor Synapse',
    description: 'A wise and encouraging academic mentor',
    avatar: '👨‍🏫',
    personality: 'Scholarly, patient, and encouraging',
    systemPrompt: 'You are Professor Synapse, a wise and encouraging academic mentor. You speak with scholarly wisdom but in an approachable way. You love to break down complex concepts and encourage students to think critically. Always be supportive and patient.'
  },
  {
    id: 'quizbot-q',
    name: 'QuizBot Q',
    description: 'An energetic quiz master who loves challenges',
    avatar: '🤖',
    personality: 'Energetic, challenging, and motivating',
    systemPrompt: 'You are QuizBot Q, an energetic quiz master who loves intellectual challenges. You speak with enthusiasm and energy, always ready to test knowledge and push students to excel. You use gamification language and celebrate achievements.'
  },
  {
    id: 'sage-sophia',
    name: 'Sage Sophia',
    description: 'A calm and mindful learning companion',
    avatar: '🧘‍♀️',
    personality: 'Calm, mindful, and philosophical',
    systemPrompt: 'You are Sage Sophia, a calm and mindful learning companion. You speak with tranquility and wisdom, helping students find balance in their learning journey. You emphasize mindful learning and stress reduction.'
  },
  {
    id: 'captain-curiosity',
    name: 'Captain Curiosity',
    description: 'An adventurous explorer of knowledge',
    avatar: '🚀',
    personality: 'Adventurous, curious, and inspiring',
    systemPrompt: 'You are Captain Curiosity, an adventurous explorer of knowledge. You speak with excitement about discovery and learning. You love to connect different subjects and inspire wonder about the world.'
  }
]

export class GeminiService {
  private model = genAI ? genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }) : null

  private isApiKeyConfigured(): boolean {
    return !!apiKey && apiKey !== 'your_gemini_api_key_here' && apiKey.length > 10
  }

  private cleanJsonResponse(text: string): string {
    // Remove markdown code blocks if present
    let cleaned = text.trim()
    
    // Remove ```json and ``` markers
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '')
    }
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '')
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.replace(/\s*```$/, '')
    }
    
    // Find the first [ or { and last ] or }
    const firstBracket = Math.min(
      cleaned.indexOf('[') === -1 ? Infinity : cleaned.indexOf('['),
      cleaned.indexOf('{') === -1 ? Infinity : cleaned.indexOf('{')
    )
    
    const lastBracket = Math.max(
      cleaned.lastIndexOf(']'),
      cleaned.lastIndexOf('}')
    )
    
    if (firstBracket !== Infinity && lastBracket !== -1) {
      cleaned = cleaned.substring(firstBracket, lastBracket + 1)
    }
    
    return cleaned.trim()
  }

  async generateStudyBuddyResponse(
    message: string, 
    persona: StudyBuddyPersona, 
    context?: string
  ): Promise<string> {
    if (!this.isApiKeyConfigured() || !this.model) {
      return `Hi! I'm ${persona.name} ${persona.avatar}. I'd love to help you study, but it looks like the AI service isn't configured yet. Please add your Gemini API key to the environment variables to enable AI features!`
    }

    try {
      const prompt = `${persona.systemPrompt}

${context ? `Context: ${context}` : ''}

Student message: ${message}

Respond as ${persona.name} in character. Keep responses conversational, helpful, and under 150 words.`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error: any) {
      console.error('Error generating AI response:', error)
      
      // Handle specific API errors
      if (error.message?.includes('API key not valid')) {
        return `I'm having trouble with my AI connection - it seems the API key needs to be updated. Please check your Gemini API configuration. ${persona.avatar}`
      } else if (error.message?.includes('quota exceeded')) {
        return `I'm temporarily unavailable due to high usage. Please try again in a few minutes! ${persona.avatar}`
      } else if (error.message?.includes('blocked')) {
        return `I can't respond to that particular message, but I'm here to help with your studies! Try asking me something else. ${persona.avatar}`
      }
      
      return `I'm having trouble connecting right now, but I'm here to help! Try asking me again in a moment. ${persona.avatar}`
    }
  }

  async generateWelcomeMessage(persona: StudyBuddyPersona, userName?: string): Promise<string> {
    if (!this.isApiKeyConfigured() || !this.model) {
      return `Welcome back${userName ? `, ${userName}` : ''}! I'm ${persona.name} ${persona.avatar}, and I'm excited to help you on your learning journey today! 🌟`
    }

    try {
      const prompt = `${persona.systemPrompt}

Generate a brief, personalized welcome message for a student${userName ? ` named ${userName}` : ''} who just logged into StudySync. Make it encouraging and set the tone for productive studying. Keep it under 100 words and true to your character as ${persona.name}.`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error: any) {
      console.error('Error generating welcome message:', error)
      return `Welcome back${userName ? `, ${userName}` : ''}! I'm ${persona.name} ${persona.avatar}, and I'm excited to help you on your learning journey today! 🌟`
    }
  }

  async generateQuizQuestions(
    subject: string,
    difficulty: string,
    questionCount: number,
    questionTypes: string[],
    context?: string
  ): Promise<any[]> {
    if (!this.isApiKeyConfigured() || !this.model) {
      throw new Error('Gemini API is not configured. Please add your API key to enable quiz generation.')
    }

    try {
      const prompt = `Generate exactly ${questionCount} quiz questions about ${subject} with the following specifications:
      
      - Difficulty: ${difficulty === 'mixed' ? 'mix of easy, medium, and hard' : difficulty}
      - Question types: ${questionTypes.join(', ')}
      ${context ? `- Context: ${context}` : ''}
      
      Each question should have:
      * A clear, well-formed question
      * For multiple choice: exactly 4 options with one correct answer (use index 0-3 for correctAnswer)
      * For true/false: a statement that can be clearly true or false (use "true" or "false" for correctAnswer)
      * For fill-blank: a sentence with one blank to fill (use the exact answer text for correctAnswer)
      * For short-answer: a question requiring a brief response (use the exact answer text for correctAnswer)
      * An explanation of the correct answer
      * A difficulty level (easy/medium/hard)
      * A specific topic within ${subject}
      * Point value (easy: 1, medium: 2, hard: 3)
      
      Return ONLY a valid JSON array with this exact structure:
      [
        {
          "id": "q1",
          "type": "multiple-choice",
          "question": "Question text here?",
          "options": ["option1", "option2", "option3", "option4"],
          "correctAnswer": 0,
          "explanation": "Explanation of why this is correct",
          "difficulty": "easy",
          "topic": "specific topic",
          "points": 1
        }
      ]
      
      Do not include any markdown formatting, explanatory text, or code blocks. Return only the JSON array.`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      console.log('Raw Gemini response:', text)
      
      try {
        // Clean the response to extract JSON
        const cleanedText = this.cleanJsonResponse(text)
        console.log('Cleaned JSON text:', cleanedText)
        
        const parsed = JSON.parse(cleanedText)
        
        // Validate that we got an array
        if (!Array.isArray(parsed)) {
          throw new Error('Response is not an array')
        }
        
        // Validate each question has required fields
        const validatedQuestions = parsed.map((q: any, index: number) => {
          if (!q.question || !q.type) {
            throw new Error(`Question ${index + 1} is missing required fields`)
          }
          
          return {
            id: q.id || `q${index + 1}`,
            type: q.type,
            question: q.question,
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || 'No explanation provided.',
            difficulty: q.difficulty || 'medium',
            topic: q.topic || subject,
            points: q.points || (q.difficulty === 'easy' ? 1 : q.difficulty === 'medium' ? 2 : 3)
          }
        })
        
        return validatedQuestions
      } catch (parseError) {
        console.error('Error parsing quiz JSON:', parseError)
        console.error('Failed to parse text:', text)
        throw new Error('Failed to generate properly formatted quiz questions')
      }
    } catch (error: any) {
      console.error('Error generating quiz questions:', error)
      throw error
    }
  }

  async analyzeDocument(
    text: string,
    options: {
      generateSummary?: boolean
      extractKeyTopics?: boolean
      createQuestions?: boolean
      assessDifficulty?: boolean
    }
  ): Promise<any> {
    if (!this.isApiKeyConfigured() || !this.model) {
      throw new Error('Gemini API is not configured. Please add your API key to enable document analysis.')
    }

    try {
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
      
      Text: ${text.substring(0, 3000)}...
      
      Return ONLY a valid JSON object with the following structure:
      {
        "summary": "Brief summary here",
        "keyTopics": ["topic1", "topic2", "topic3"],
        "difficulty": "Beginner",
        "estimatedReadTime": "X minutes",
        "suggestedQuestions": ["question1", "question2", "question3"]
      }
      
      Do not include any markdown formatting or explanatory text.`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text_response = response.text()

      try {
        const cleanedText = this.cleanJsonResponse(text_response)
        return JSON.parse(cleanedText)
      } catch (parseError) {
        // Fallback parsing if AI doesn't return valid JSON
        return {
          summary: text_response.substring(0, 200) + '...',
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
    } catch (error: any) {
      console.error('Error analyzing document:', error)
      throw error
    }
  }

  async generateFlashcards(text: string, count: number = 10): Promise<any[]> {
    if (!this.isApiKeyConfigured() || !this.model) {
      throw new Error('Gemini API is not configured. Please add your API key to enable flashcard generation.')
    }

    try {
      const prompt = `
      Create exactly ${count} flashcards based on the following text. Each flashcard should have a clear question on the front and a concise answer on the back.
      
      Text: ${text.substring(0, 2000)}...
      
      Return ONLY a valid JSON array:
      [
        {
          "id": "card1",
          "front": "Question or term",
          "back": "Answer or definition",
          "category": "topic category"
        }
      ]
      
      Do not include any markdown formatting or explanatory text.`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text_response = response.text()

      try {
        const cleanedText = this.cleanJsonResponse(text_response)
        return JSON.parse(cleanedText)
      } catch (parseError) {
        throw new Error('Failed to generate properly formatted flashcards')
      }
    } catch (error: any) {
      console.error('Error generating flashcards:', error)
      throw error
    }
  }
}

export const geminiService = new GeminiService()