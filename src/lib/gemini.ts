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

export interface DocumentAnalysisOptions {
  generateSummary?: boolean
  extractKeyTopics?: boolean
  createQuestions?: boolean
  assessDifficulty?: boolean
}

export interface DocumentAnalysis {
  summary?: string
  keyTopics?: string[]
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced'
  estimatedReadTime?: string
  suggestedQuestions?: string[]
}

export class GeminiService {
  private model = genAI ? genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }) : null
  private apiKeyStatus = !!apiKey && apiKey !== 'your_gemini_api_key_here';

  public getServiceStatus() {
    return {
      apiKeyConfigured: this.apiKeyStatus,
      modelInitialized: !!this.model
    };
  }

  private isApiKeyConfigured(): boolean {
    return !!apiKey && apiKey !== 'your_gemini_api_key_here'
  }

  async analyzeDocument(
    documentText: string,
    options: DocumentAnalysisOptions = {}
  ): Promise<DocumentAnalysis> {
    if (!this.isApiKeyConfigured() || !this.model) {
      // Return mock analysis when API is not configured
      return {
        summary: options.generateSummary ? 'This document contains important educational content that can be used for studying. The AI analysis service is not currently configured.' : undefined,
        keyTopics: options.extractKeyTopics ? ['Key Topic 1', 'Key Topic 2', 'Key Topic 3'] : undefined,
        difficulty: options.assessDifficulty ? 'Intermediate' : undefined,
        estimatedReadTime: '5-10 minutes',
        suggestedQuestions: options.createQuestions ? [
          'What are the main concepts discussed in this document?',
          'How do these concepts relate to each other?',
          'What are the practical applications of this knowledge?',
          'What questions would help test understanding of this material?'
        ] : undefined
      }
    }

    try {
      const analysisPrompts = []
      
      if (options.generateSummary) {
        analysisPrompts.push('Generate a concise summary of the main points')
      }
      
      if (options.extractKeyTopics) {
        analysisPrompts.push('Extract 3-5 key topics or concepts')
      }
      
      if (options.assessDifficulty) {
        analysisPrompts.push('Assess the difficulty level as Beginner, Intermediate, or Advanced')
      }
      
      if (options.createQuestions) {
        analysisPrompts.push('Create 4-6 study questions that test understanding')
      }

      const prompt = `Analyze the following document and provide the requested analysis:

Document text:
${documentText}

Please provide analysis for:
${analysisPrompts.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Format your response as JSON with the following structure:
{
  ${options.generateSummary ? '"summary": "your summary here",' : ''}
  ${options.extractKeyTopics ? '"keyTopics": ["topic1", "topic2", "topic3"],' : ''}
  ${options.assessDifficulty ? '"difficulty": "Beginner|Intermediate|Advanced",' : ''}
  "estimatedReadTime": "X-Y minutes",
  ${options.createQuestions ? '"suggestedQuestions": ["question1", "question2", "question3", "question4"]' : ''}
}

Ensure the JSON is valid and complete.`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      try {
        // Try to parse as JSON
        const analysis = JSON.parse(text)
        return analysis
      } catch (parseError) {
        // If JSON parsing fails, create a structured response from the text
        console.warn('Failed to parse AI response as JSON, creating structured response')
        
        return {
          summary: options.generateSummary ? text.substring(0, 200) + '...' : undefined,
          keyTopics: options.extractKeyTopics ? ['AI Analysis', 'Document Content', 'Study Material'] : undefined,
          difficulty: options.assessDifficulty ? 'Intermediate' : undefined,
          estimatedReadTime: '5-10 minutes',
          suggestedQuestions: options.createQuestions ? [
            'What are the main points discussed?',
            'How can this information be applied?',
            'What are the key takeaways?',
            'How does this relate to other concepts?'
          ] : undefined
        }
      }
    } catch (error) {
      console.error('Error analyzing document:', error)
      
      // Return fallback analysis
      return {
        summary: options.generateSummary ? 'Unable to generate summary at this time. Please try again later.' : undefined,
        keyTopics: options.extractKeyTopics ? ['Document Analysis', 'Study Content'] : undefined,
        difficulty: options.assessDifficulty ? 'Intermediate' : undefined,
        estimatedReadTime: '5-10 minutes',
        suggestedQuestions: options.createQuestions ? [
          'What are the main concepts in this document?',
          'How can this knowledge be applied?',
          'What are the most important points to remember?'
        ] : undefined
      }
    }
  }

  async generateFlashcards(documentText: string, count: number = 8): Promise<Array<{
    id: string
    front: string
    back: string
    category: string
  }>> {
    if (!this.isApiKeyConfigured() || !this.model) {
      // Return mock flashcards when API is not configured
      return Array.from({ length: count }, (_, i) => ({
        id: `card-${i + 1}`,
        front: `Question ${i + 1}: What is an important concept from this document?`,
        back: `Answer ${i + 1}: This is a key concept that helps understand the material better.`,
        category: 'General Knowledge'
      }))
    }

    try {
      const prompt = `Create ${count} flashcards based on the following document. Each flashcard should have a question on the front and an answer on the back.

Document text:
${documentText}

Format your response as JSON array:
[
  {
    "id": "card-1",
    "front": "Question text",
    "back": "Answer text",
    "category": "Topic category"
  }
]

Make sure the questions test understanding of key concepts and the answers are clear and informative.`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      try {
        const flashcards = JSON.parse(text)
        return Array.isArray(flashcards) ? flashcards : []
      } catch (parseError) {
        console.warn('Failed to parse flashcards as JSON, creating fallback cards')
        
        // Return fallback flashcards
        return Array.from({ length: Math.min(count, 4) }, (_, i) => ({
          id: `card-${i + 1}`,
          front: `What is key concept ${i + 1} from this document?`,
          back: `This represents an important idea that should be understood and remembered.`,
          category: 'Study Material'
        }))
      }
    } catch (error) {
      console.error('Error generating flashcards:', error)
      
      // Return fallback flashcards
      return Array.from({ length: Math.min(count, 4) }, (_, i) => ({
        id: `card-${i + 1}`,
        front: `Study Question ${i + 1}`,
        back: `This is important information from the document that you should review.`,
        category: 'General'
      }))
    }
  }

  async generateStudyBuddyResponse(
    message: string, 
    persona: StudyBuddyPersona, 
    context?: string
  ): Promise<string> {
    if (!this.isApiKeyConfigured() || !this.model) {
      return `Hi! I'm ${persona.name} ${persona.avatar}. I'd love to help you study, but it looks like the AI service isn't configured yet. You can still explore the other features of StudySync!`
    }

    try {
      const prompt = `${persona.systemPrompt}

${context ? `Context: ${context}` : ''}

Student message: ${message}

Respond as ${persona.name} in character. Keep responses conversational, helpful, and under 150 words.`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Error generating AI response:', error)
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
    } catch (error) {
      console.error('Error generating welcome message:', error)
      return `Welcome back${userName ? `, ${userName}` : ''}! I'm ${persona.name} ${persona.avatar}, and I'm excited to help you on your learning journey today! 🌟`
    }
  }
}

export const geminiService = new GeminiService()