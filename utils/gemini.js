import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function GeminiChat(prompt) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }); // ✅ SWITCHED MODEL

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (err) {
    console.error('❌ GeminiChat Error:', err);
    return '[Gemini failed to respond]';
  }
}
