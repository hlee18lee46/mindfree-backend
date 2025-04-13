import express from 'express';
import { connectToDatabase } from '../utils/db.js';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

router.post('/', async (req, res) => {
  const { userId, messages } = req.body;

  if (!userId || !Array.isArray(messages)) {
    return res.status(400).json({ message: 'Missing userId or messages' });
  }

  try {
    const geminiHistory = messages
    .filter((msg) =>
      msg?.content?.trim() &&
      msg.content !== '[Gemini could not generate a response. Try again later.]' &&
      ['user', 'ai'].includes(msg.role)
    )
          .map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

    if (geminiHistory.length === 0) {
      return res.status(400).json({ message: 'No valid user messages to send to Gemini.' });
    }

    console.log('🧠 Gemini Payload:', JSON.stringify(geminiHistory, null, 2));

    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: geminiHistory,
    });

    const response = result?.response;
    const text = typeof response?.text === 'function'
      ? await response.text()
      : '[Gemini could not generate a response. Try again later.]';

    const db = await connectToDatabase();
    await db.collection('chat').insertOne({
      userId,
      messages,
      response: text,
      timestamp: new Date()
    });

    res.status(200).json({ response: text });
  } catch (err) {
    console.error('❌ Gemini chat error:', err);
    res.status(500).json({ message: 'Gemini chat failed', error: err.message });
  }
});

export default router;
