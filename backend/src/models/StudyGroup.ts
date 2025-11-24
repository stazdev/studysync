import mongoose from 'mongoose';

const studyGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  isPrivate: {
    type: Boolean,
    default: false,
  },
  joinCode: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const StudyGroup = mongoose.model('StudyGroup', studyGroupSchema);

export default StudyGroup;
