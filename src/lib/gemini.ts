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