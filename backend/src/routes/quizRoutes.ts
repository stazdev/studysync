import express from 'express';
import { createQuiz, getQuizzes, getQuizById, submitQuizAttempt } from '../controllers/quizController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/').post(protect, createQuiz).get(protect, getQuizzes);
router.route('/:id').get(protect, getQuizById);
router.route('/:id/submit').post(protect, submitQuizAttempt);

export default router;
