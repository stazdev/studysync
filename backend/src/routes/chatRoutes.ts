import express from 'express';
import { getMessages } from '../controllers/chatController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/:groupId', protect, getMessages);

export default router;
