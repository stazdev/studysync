import express from 'express';
import { analyzeContent, chatWithAI } from '../controllers/aiController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/analyze', protect, analyzeContent);
router.post('/chat', protect, chatWithAI);

export default router;
