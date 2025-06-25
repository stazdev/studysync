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

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  topic?: string
  points?: number
  type?: string
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

  async generateQuizQuestions(
    subject: string,
    difficulty: 'mixed' | 'easy' | 'medium' | 'hard',
    questionCount: number = 10,
    questionTypes: string[] = ['multiple-choice']
  ): Promise<QuizQuestion[]> {
    if (!this.isApiKeyConfigured() || !this.model) {
      // Return subject-specific mock questions when API is not configured
      return this.generateSubjectSpecificMockQuestions(subject, difficulty, questionCount);
    }

    try {
      // Create a detailed prompt with subject-specific instructions
      const prompt = `Generate ${questionCount} ${difficulty !== 'mixed' ? difficulty : ''} quiz questions about ${subject}.

Each question must be specifically about ${subject} concepts, theories, or facts. Do not generate generic questions.

Requirements:
- Questions must test specific knowledge of ${subject}
- Each question should have 4 answer options
- Include the correct answer index (0-3)
- Provide a brief explanation for the correct answer
- Make questions appropriate for ${difficulty !== 'mixed' ? difficulty : 'varying'} difficulty level
- Include a mix of factual, conceptual, and application questions

Format your response as a JSON array:
[
  {
    "id": "q1",
    "question": "Specific question about ${subject}?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Explanation of why this answer is correct",
    "difficulty": "medium",
    "category": "${subject}",
    "topic": "Specific topic within ${subject}"
  }
]

Ensure the JSON is valid and complete.`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      try {
        // Try to parse as JSON
        const questions = JSON.parse(text)
        
        if (!Array.isArray(questions) || questions.length === 0) {
          throw new Error('Invalid question format returned')
        }
        
        // Validate and format each question
        return questions.map((q, index) => ({
          id: q.id || `q${index + 1}`,
          question: q.question,
          options: Array.isArray(q.options) && q.options.length === 4 ? q.options : 
            ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
          explanation: q.explanation || `This is an important concept in ${subject}.`,
          difficulty: q.difficulty || (difficulty === 'mixed' ? 'medium' : difficulty),
          category: subject,
          topic: q.topic || subject,
          type: 'multiple-choice'
        }))
      } catch (parseError) {
        console.warn('Failed to parse quiz questions as JSON, creating subject-specific fallback questions')
        return this.generateSubjectSpecificMockQuestions(subject, difficulty, questionCount);
      }
    } catch (error) {
      console.error('Error generating quiz questions:', error)
      return this.generateSubjectSpecificMockQuestions(subject, difficulty, questionCount);
    }
  }

  private generateSubjectSpecificMockQuestions(
    subject: string, 
    difficulty: 'mixed' | 'easy' | 'medium' | 'hard',
    count: number
  ): QuizQuestion[] {
    // Map of subject-specific questions
    const subjectQuestions: Record<string, QuizQuestion[]> = {
      'Mathematics': [
        {
          id: 'math1',
          question: 'What is the derivative of x²?',
          options: ['2x', 'x', '2', 'x²'],
          correctAnswer: 0,
          explanation: 'Using the power rule: d/dx(x²) = 2x¹ = 2x',
          difficulty: 'easy',
          category: 'Mathematics',
          topic: 'Calculus'
        },
        {
          id: 'math2',
          question: 'What is the value of π (pi) to two decimal places?',
          options: ['3.14', '3.41', '3.12', '3.16'],
          correctAnswer: 0,
          explanation: 'Pi is approximately equal to 3.14159..., which rounds to 3.14',
          difficulty: 'easy',
          category: 'Mathematics',
          topic: 'Constants'
        },
        {
          id: 'math3',
          question: 'What is the quadratic formula?',
          options: [
            'x = (-b ± √(b² - 4ac)) / 2a',
            'x = (-b ± √(b² + 4ac)) / 2a',
            'x = (b ± √(b² - 4ac)) / 2a',
            'x = (-b ± √(b² - 4ac)) / a'
          ],
          correctAnswer: 0,
          explanation: 'The quadratic formula for solving ax² + bx + c = 0 is x = (-b ± √(b² - 4ac)) / 2a',
          difficulty: 'medium',
          category: 'Mathematics',
          topic: 'Algebra'
        }
      ],
      'Physics': [
        {
          id: 'phys1',
          question: 'What is Newton\'s Second Law of Motion?',
          options: [
            'F = ma',
            'E = mc²',
            'For every action, there is an equal and opposite reaction',
            'Objects in motion stay in motion unless acted upon by an external force'
          ],
          correctAnswer: 0,
          explanation: 'Newton\'s Second Law states that force equals mass times acceleration (F = ma)',
          difficulty: 'medium',
          category: 'Physics',
          topic: 'Classical Mechanics'
        },
        {
          id: 'phys2',
          question: 'Which of these is a unit of force?',
          options: ['Newton', 'Joule', 'Watt', 'Volt'],
          correctAnswer: 0,
          explanation: 'The Newton (N) is the SI unit of force, equal to 1 kg·m/s²',
          difficulty: 'easy',
          category: 'Physics',
          topic: 'Units'
        }
      ],
      'Chemistry': [
        {
          id: 'chem1',
          question: 'What is the chemical symbol for gold?',
          options: ['Au', 'Ag', 'Fe', 'Gd'],
          correctAnswer: 0,
          explanation: 'Au is the chemical symbol for gold, derived from the Latin word "aurum"',
          difficulty: 'easy',
          category: 'Chemistry',
          topic: 'Periodic Table'
        },
        {
          id: 'chem2',
          question: 'What is the pH of a neutral solution at 25°C?',
          options: ['7', '0', '14', '1'],
          correctAnswer: 0,
          explanation: 'A neutral solution has a pH of 7, with acidic solutions below 7 and basic solutions above 7',
          difficulty: 'easy',
          category: 'Chemistry',
          topic: 'Acids and Bases'
        }
      ],
      'Biology': [
        {
          id: 'bio1',
          question: 'What is the powerhouse of the cell?',
          options: ['Mitochondria', 'Nucleus', 'Endoplasmic reticulum', 'Golgi apparatus'],
          correctAnswer: 0,
          explanation: 'Mitochondria are responsible for cellular respiration and ATP production, earning them the nickname "powerhouse of the cell"',
          difficulty: 'easy',
          category: 'Biology',
          topic: 'Cell Biology'
        },
        {
          id: 'bio2',
          question: 'Which of the following is NOT a nucleotide found in DNA?',
          options: ['Uracil', 'Adenine', 'Guanine', 'Thymine'],
          correctAnswer: 0,
          explanation: 'DNA contains the nucleotides Adenine, Guanine, Cytosine, and Thymine. Uracil is found in RNA instead of Thymine.',
          difficulty: 'medium',
          category: 'Biology',
          topic: 'Genetics'
        },
        {
          id: 'bio3',
          question: 'What process do plants use to convert light energy into chemical energy?',
          options: ['Photosynthesis', 'Respiration', 'Fermentation', 'Digestion'],
          correctAnswer: 0,
          explanation: 'Photosynthesis is the process by which plants convert light energy into chemical energy stored in glucose',
          difficulty: 'easy',
          category: 'Biology',
          topic: 'Plant Biology'
        }
      ],
      'Computer Science': [
        {
          id: 'cs1',
          question: 'What does CPU stand for?',
          options: [
            'Central Processing Unit',
            'Computer Processing Unit',
            'Central Program Unit',
            'Central Processor Unit'
          ],
          correctAnswer: 0,
          explanation: 'CPU stands for Central Processing Unit, which is the primary component of a computer that performs most of the processing',
          difficulty: 'easy',
          category: 'Computer Science',
          topic: 'Hardware'
        },
        {
          id: 'cs2',
          question: 'Which of these is NOT a programming paradigm?',
          options: [
            'Quantum Programming',
            'Object-Oriented Programming',
            'Functional Programming',
            'Procedural Programming'
          ],
          correctAnswer: 0,
          explanation: 'While quantum computing exists, "Quantum Programming" is not a standard programming paradigm like OOP, functional, or procedural programming',
          difficulty: 'medium',
          category: 'Computer Science',
          topic: 'Programming'
        }
      ],
      'History': [
        {
          id: 'hist1',
          question: 'In what year did World War II end?',
          options: ['1945', '1939', '1918', '1941'],
          correctAnswer: 0,
          explanation: 'World War II ended in 1945 with the surrender of Japan following the atomic bombings of Hiroshima and Nagasaki',
          difficulty: 'easy',
          category: 'History',
          topic: 'World War II'
        },
        {
          id: 'hist2',
          question: 'Who was the first President of the United States?',
          options: ['George Washington', 'Thomas Jefferson', 'Abraham Lincoln', 'John Adams'],
          correctAnswer: 0,
          explanation: 'George Washington served as the first President of the United States from 1789 to 1797',
          difficulty: 'easy',
          category: 'History',
          topic: 'American History'
        }
      ]
    };
    
    // Default questions for subjects not in our map
    const defaultQuestions: QuizQuestion[] = [
      {
        id: 'default1',
        question: `What is an important concept in ${subject}?`,
        options: [
          'This is a key concept',
          'This is another important idea',
          'This relates to the main topic',
          'This is a fundamental principle'
        ],
        correctAnswer: 0,
        explanation: `This question tests understanding of ${subject} concepts.`,
        difficulty: 'medium',
        category: subject,
        topic: subject
      },
      {
        id: 'default2',
        question: `Which of the following best describes a principle in ${subject}?`,
        options: [
          'A fundamental theory that explains key phenomena',
          'A minor concept with limited applications',
          'An outdated idea no longer in use',
          'A technique only used in specialized contexts'
        ],
        correctAnswer: 0,
        explanation: `This tests knowledge of core principles in ${subject}.`,
        difficulty: 'medium',
        category: subject,
        topic: subject
      }
    ];
    
    // Get subject-specific questions or use defaults
    const availableQuestions = subjectQuestions[subject] || defaultQuestions;
    
    // If we don't have enough questions, pad with generated ones
    if (availableQuestions.length < count) {
      const additionalNeeded = count - availableQuestions.length;
      
      for (let i = 0; i < additionalNeeded; i++) {
        availableQuestions.push({
          id: `${subject.toLowerCase()}-gen-${i}`,
          question: `What is another important concept in ${subject}?`,
          options: [
            `A key ${subject} principle`,
            `A secondary ${subject} concept`,
            `A related ${subject} theory`,
            `A specialized ${subject} application`
          ],
          correctAnswer: 0,
          explanation: `This tests knowledge of ${subject} fundamentals.`,
          difficulty: difficulty === 'mixed' ? (i % 3 === 0 ? 'easy' : i % 3 === 1 ? 'medium' : 'hard') : difficulty as 'easy' | 'medium' | 'hard',
          category: subject,
          topic: `${subject} Fundamentals`
        });
      }
    }
    
    // Return the requested number of questions
    return availableQuestions.slice(0, count);
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