import express from 'express';
import { registerUser, loginUser, getUserProfile, updateUserProfile, uploadAvatar } from '../controllers/authController';
import { protect } from '../middleware/auth';
import multer from 'multer';
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
    destination(req, file, cb) {
      cb(null, 'uploads/');
    },
    filename(req, file, cb) {
      cb(
        null,
        `avatar-${Date.now()}${path.extname(file.originalname)}`
      );
    },
  });

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/profile/avatar', protect, upload.single('file'), uploadAvatar);

export default router;
