import express from 'express';
import {
    createSession,
    getSessions,
    getSessionById,
    joinSession,
    leaveSession,
    updateSession,
    deleteSession
} from '../controllers/sessionController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/').post(protect, createSession).get(protect, getSessions);
router.route('/:id')
    .get(protect, getSessionById)
    .put(protect, updateSession)
    .delete(protect, deleteSession);

router.post('/:id/join', protect, joinSession);
router.post('/:id/leave', protect, leaveSession);

export default router;
