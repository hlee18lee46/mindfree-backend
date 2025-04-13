// routes/history.js
import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.send('History route');
});

export default router; // ✅ this fixes the error
