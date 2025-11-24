import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db';
import path from 'path';

dotenv.config();

connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
import authRoutes from './routes/authRoutes';
import groupRoutes from './routes/groupRoutes';
import materialRoutes from './routes/materialRoutes';
import quizRoutes from './routes/quizRoutes';
import aiRoutes from './routes/aiRoutes';
import notificationRoutes from './routes/notificationRoutes';
import sessionRoutes from './routes/sessionRoutes';
import chatRoutes from './routes/chatRoutes';
import Message from './models/Message';

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/chat', chatRoutes);

// Socket.io
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_group', (groupId) => {
    socket.join(groupId);
    console.log(`User ${socket.id} joined group ${groupId}`);
  });

  socket.on('leave_group', (groupId) => {
    socket.leave(groupId);
    console.log(`User ${socket.id} left group ${groupId}`);
  });

  socket.on('send_message', async (data) => {
    // data: { groupId, content, senderId, senderName, senderAvatar }
    // Save to DB
    try {
        const { groupId, content, senderId } = data;
        const newMessage = await Message.create({
            groupId,
            content,
            sender: senderId,
        });

        const populatedMessage = await newMessage.populate('sender', 'fullName avatarUrl');

        // Broadcast to room
        io.to(groupId).emit('receive_message', populatedMessage);
    } catch (err) {
        console.error("Socket message error:", err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };
