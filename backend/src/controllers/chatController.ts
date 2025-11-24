import { Request, Response } from 'express';
import Message from '../models/Message';

export const getMessages = async (req: any, res: Response) => {
  try {
    const { groupId } = req.params;

    const messages = await Message.find({ groupId })
      .populate('sender', 'fullName avatarUrl')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
