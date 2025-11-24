import api from './api';

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

  public getServiceStatus() {
    return {
      apiKeyConfigured: true, // Managed by backend
      modelInitialized: true
    };
  }

  async analyzeDocument(
    documentText: string,
    options: DocumentAnalysisOptions = {}
  ): Promise<DocumentAnalysis> {
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

Ensure the JSON is valid and complete.`;

      const { data } = await api.post('/ai/analyze', { prompt });
      
      try {
        let text = data.result;
        // Handle case where result might be wrapped in markdown code block
        text = text.replace(/```json\n?|\n?```/g, '');
        const analysis = JSON.parse(text);
        return analysis;
      } catch (parseError) {
        console.warn('Failed to parse AI response as JSON', parseError);
        // Fallback or re-throw
        throw new Error('Failed to parse analysis result');
      }
    } catch (error) {
      console.error('Error analyzing document:', error);
      throw error;
    }
  }

  async generateFlashcards(documentText: string, count: number = 8): Promise<Array<{
    id: string
    front: string
    back: string
    category: string
  }>> {
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

Make sure the questions test understanding of key concepts and the answers are clear and informative.`;

      const { data } = await api.post('/ai/analyze', { prompt });
      
      try {
        let text = data.result;
        text = text.replace(/```json\n?|\n?```/g, '');
        const flashcards = JSON.parse(text);
        return Array.isArray(flashcards) ? flashcards : [];
      } catch (parseError) {
        console.warn('Failed to parse flashcards as JSON');
        return [];
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
      return [];
    }
  }

  async generateQuizQuestions(
    subject: string,
    difficulty: 'mixed' | 'easy' | 'medium' | 'hard',
    questionCount: number = 10,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _questionTypes: string[] = ['multiple-choice']
  ): Promise<QuizQuestion[]> {
    try {
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

Ensure the JSON is valid and complete.`;

      const { data } = await api.post('/ai/analyze', { prompt });

      try {
        let text = data.result;
        text = text.replace(/```json\n?|\n?```/g, '');
        const questions = JSON.parse(text);
        
        if (!Array.isArray(questions)) throw new Error('Invalid format');

        return questions.map((q: any, index: number) => ({
          id: q.id || `q${index + 1}`,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: q.difficulty || 'medium',
          category: subject,
          topic: q.topic || subject,
          type: 'multiple-choice'
        }));
      } catch (parseError) {
        console.warn('Failed to parse quiz questions as JSON');
        return [];
      }
    } catch (error) {
      console.error('Error generating quiz questions:', error);
      return [];
    }
  }

  async generateStudyBuddyResponse(
    message: string, 
    persona: StudyBuddyPersona, 
    context?: string
  ): Promise<string> {
    try {
        // Use chat endpoint or analyze endpoint?
        // Chat endpoint supports history, but here we are just sending a prompt.
        // We can use chatWithAI controller if we maintain history, but for single response generateContent is fine.
        // However, let's use the analyze/generateContent endpoint on backend.

        const prompt = `${persona.systemPrompt}

${context ? `Context: ${context}` : ''}

Student message: ${message}

Respond as ${persona.name} in character. Keep responses conversational, helpful, and under 150 words.`;

        const { data } = await api.post('/ai/analyze', { prompt });
        return data.result;
    } catch (error) {
      console.error('Error generating AI response:', error);
      return `I'm having trouble connecting right now. ${persona.avatar}`;
    }
  }

  async generateWelcomeMessage(persona: StudyBuddyPersona, userName?: string): Promise<string> {
    try {
        const prompt = `${persona.systemPrompt}

Generate a brief, personalized welcome message for a student${userName ? ` named ${userName}` : ''} who just logged into StudySync. Make it encouraging and set the tone for productive studying. Keep it under 100 words and true to your character as ${persona.name}.`;

        const { data } = await api.post('/ai/analyze', { prompt });
        return data.result;
    } catch (error) {
        console.error('Error generating welcome message:', error);
        return `Welcome back! I'm ${persona.name} ${persona.avatar}`;
    }
  }
}

export const geminiService = new GeminiService();
