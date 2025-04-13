import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import midnightRoutes from './routes/midnight.js';
import historyRoutes from './routes/history.js';


dotenv.config();
console.log('🔐 GEMINI_API_KEY:', process.env.GEMINI_API_KEY); // Add this line


const app = express();
const PORT = process.env.PORT || 6300;

// ✅ Allow all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api', authRoutes); // ✅ this prefix is essential
app.use('/api/chat', chatRoutes);
app.use('/api/midnight', midnightRoutes);
app.use('/api/history', historyRoutes);
app.get('/', (req, res) => {
  res.send('🧠 MindFree AI backend is running!');
});

app.listen(PORT, () => {
  console.log(`🧠 MindFree AI backend listening on http://localhost:${PORT}`);
});
