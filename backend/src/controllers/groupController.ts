import { Request, Response } from 'express';
import StudyGroup from '../models/StudyGroup';

export const createGroup = async (req: any, res: Response) => {
  try {
    const { name, description, subject, isPrivate, imageUrl } = req.body;

    const group = await StudyGroup.create({
      name,
      description,
      subject,
      isPrivate,
      imageUrl,
      createdBy: req.user._id,
      members: [req.user._id], // Creator is automatically a member
    });

    res.status(201).json(group);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getGroups = async (req: any, res: Response) => {
  try {
    // Get public groups or groups where user is a member
    const groups = await StudyGroup.find({
      $or: [
        { isPrivate: false },
        { members: req.user._id }
      ]
    }).populate('createdBy', 'fullName avatarUrl').sort({ createdAt: -1 });

    res.json(groups);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getGroupById = async (req: Request, res: Response) => {
  try {
    const group = await StudyGroup.findById(req.params.id)
      .populate('createdBy', 'fullName avatarUrl')
      .populate('members', 'fullName avatarUrl');

    if (group) {
      res.json(group);
    } else {
      res.status(404).json({ message: 'Group not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const joinGroup = async (req: any, res: Response) => {
  try {
    const group = await StudyGroup.findById(req.params.id);

    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }

    if (group.members.includes(req.user._id)) {
      res.status(400).json({ message: 'Already a member' });
      return;
    }

    group.members.push(req.user._id);
    await group.save();

    res.json(group);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
