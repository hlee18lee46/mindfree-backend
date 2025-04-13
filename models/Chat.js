// models/Chat.js
import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  messages: [
    {
      role: { type: String, enum: ['user', 'ai'], required: true },
      content: { type: String, required: true },
    },
  ],
  response: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.Chat || mongoose.model('Chat', ChatSchema);
