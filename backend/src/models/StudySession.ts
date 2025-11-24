import mongoose from 'mongoose';

const studySessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  scheduledFor: {
    type: Date,
    required: true,
  },
  durationMinutes: {
    type: Number,
    default: 60,
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'completed', 'cancelled'],
    default: 'scheduled',
  },
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyGroup',
  },
  participants: [{
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const StudySession = mongoose.model('StudySession', studySessionSchema);

export default StudySession;
