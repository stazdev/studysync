import { Request, Response } from 'express';
import StudyMaterial from '../models/StudyMaterial';
import fs from 'fs';
import path from 'path';

// Note: File upload middleware (Multer) should handle the actual file saving before this controller

export const uploadMaterial = async (req: any, res: Response) => {
  try {
    const { title, type, content, analysis, isPublic, tags, groupId } = req.body;

    let fileUrl = '';
    if (req.file) {
      // Construct URL for the uploaded file
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
      fileUrl = `${backendUrl}/uploads/${req.file.filename}`;
    }

    const material = await StudyMaterial.create({
      title,
      type,
      content, // Or text content
      fileUrl,
      analysis,
      userId: req.user._id,
      groupId: groupId || null,
      isPublic: isPublic === 'true',
      tags: tags ? JSON.parse(tags) : [],
    });

    res.status(201).json(material);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMaterials = async (req: any, res: Response) => {
  try {
    const materials = await StudyMaterial.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(materials);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMaterialById = async (req: Request, res: Response) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);
    if (material) {
      res.json(material);
    } else {
      res.status(404).json({ message: 'Material not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMaterial = async (req: any, res: Response) => {
    try {
      const material = await StudyMaterial.findById(req.params.id);

      if (!material) {
        res.status(404).json({ message: 'Material not found' });
        return;
      }

      if (material.userId.toString() !== req.user._id.toString()) {
        res.status(401).json({ message: 'Not authorized' });
        return;
      }

      // Delete file from filesystem if it exists
      if (material.fileUrl) {
        const filename = material.fileUrl.split('/').pop();
        if (filename) {
            const filePath = path.join(__dirname, '../../uploads', filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
      }

      await material.deleteOne();
      res.json({ message: 'Material removed' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };
