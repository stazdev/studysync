import { Request, Response } from 'express';
import Quiz from '../models/Quiz';

export const createQuiz = async (req: any, res: Response) => {
  try {
    const { title, topic, difficulty, questions, materialId } = req.body;

    const quiz = await Quiz.create({
      title,
      topic,
      difficulty,
      questions,
      materialId: materialId || null,
      createdBy: req.user._id,
    });

    res.status(201).json(quiz);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getQuizzes = async (req: any, res: Response) => {
  try {
    const quizzes = await Quiz.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getQuizById = async (req: Request, res: Response) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (quiz) {
      res.json(quiz);
    } else {
      res.status(404).json({ message: 'Quiz not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const submitQuizAttempt = async (req: any, res: Response) => {
    try {
        const { answers, score, totalQuestions, timeSpent } = req.body;
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            res.status(404).json({ message: 'Quiz not found' });
            return;
        }

        // In a real app, we would verify answers and calculate score on backend
        // For now, we just acknowledge the submission.
        // Ideally, we should have a QuizAttempt model to store this.

        // Returning mock success response
        res.json({
            message: 'Quiz submitted successfully',
            score,
            totalQuestions,
            passed: score / totalQuestions >= 0.7
        });

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}
