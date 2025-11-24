import express from 'express';
import { createGroup, getGroups, getGroupById, joinGroup } from '../controllers/groupController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/').post(protect, createGroup).get(protect, getGroups);
router.route('/:id').get(protect, getGroupById);
router.route('/:id/join').post(protect, joinGroup);

export default router;
