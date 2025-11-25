import { Request, Response } from 'express';
import StudySession from '../models/StudySession';

export const createSession = async (req: any, res: Response) => {
  try {
    const { title, description, scheduledFor, durationMinutes, groupId } = req.body;

    const session = await StudySession.create({
      title,
      description,
      scheduledFor,
      durationMinutes,
      groupId: groupId || null,
      hostId: req.user._id,
      participants: [{ userId: req.user._id }]
    });

    res.status(201).json(session);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getSessions = async (req: any, res: Response) => {
  try {
    // Get sessions where user is host or participant
    const sessions = await StudySession.find({
        $or: [
            { hostId: req.user._id },
            { 'participants.userId': req.user._id }
        ]
    })
    .populate('hostId', 'fullName avatarUrl')
    .populate('participants.userId', 'fullName avatarUrl')
    .sort({ scheduledFor: 1 });

    res.json(sessions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getSessionById = async (req: Request, res: Response) => {
  try {
    const session = await StudySession.findById(req.params.id)
      .populate('hostId', 'fullName avatarUrl')
      .populate('participants.userId', 'fullName avatarUrl');

    if (session) {
      res.json(session);
    } else {
      res.status(404).json({ message: 'Session not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const joinSession = async (req: any, res: Response) => {
    try {
        const session = await StudySession.findById(req.params.id);
        if (!session) {
            res.status(404).json({ message: 'Session not found' });
            return;
        }

        // Check if already joined
        if (session.participants.some((p: any) => p.userId.toString() === req.user._id.toString())) {
            res.status(400).json({ message: 'Already joined' });
            return;
        }

        session.participants.push({ userId: req.user._id });
        await session.save();
        res.json({ message: 'Joined session' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const leaveSession = async (req: any, res: Response) => {
    try {
        const session = await StudySession.findById(req.params.id);
        if (!session) {
            res.status(404).json({ message: 'Session not found' });
            return;
        }

        session.participants = session.participants.filter(
            (p: any) => p.userId.toString() !== req.user._id.toString()
        ) as any;
        await session.save();
        res.json({ message: 'Left session' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSession = async (req: any, res: Response) => {
    try {
        const session = await StudySession.findById(req.params.id);
        if (!session) {
            res.status(404).json({ message: 'Session not found' });
            return;
        }

        if (session.hostId.toString() !== req.user._id.toString()) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }

        const { status } = req.body;
        if (status) session.status = status;

        await session.save();
        res.json(session);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteSession = async (req: any, res: Response) => {
    try {
        const session = await StudySession.findById(req.params.id);
        if (!session) {
            res.status(404).json({ message: 'Session not found' });
            return;
        }

        if (session.hostId.toString() !== req.user._id.toString()) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }

        await session.deleteOne();
        res.json({ message: 'Session deleted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
