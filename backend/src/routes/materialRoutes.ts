import express from 'express';
import { uploadMaterial, getMaterials, getMaterialById, deleteMaterial } from '../controllers/materialController';
import { protect } from '../middleware/auth';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure Multer for disk storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

router.route('/').post(protect, upload.single('file'), uploadMaterial).get(protect, getMaterials);
router.route('/:id').get(protect, getMaterialById).delete(protect, deleteMaterial);

export default router;
