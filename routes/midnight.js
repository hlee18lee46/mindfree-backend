import express from 'express';
import { connectToDatabase } from '../utils/db.js';
import { WalletBuilder } from '@midnight-ntwrk/wallet';
import { NetworkId } from '@midnight-ntwrk/zswap';

const router = express.Router();
// routes/midnight.js
router.get('/anchors/:userId', async (req, res) => {
  const db = await connectToDatabase();
  const { userId } = req.params;

  try {
    const anchors = await db.collection('anchors')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({ anchors });
  } catch (err) {
    console.error('❌ Failed to fetch anchor logs:', err);
    res.status(500).json({ error: 'Failed to fetch anchors' });
  }
});
router.post('/anchor', async (req, res) => {
  const { userId, hash } = req.body;
  if (!userId || !hash) return res.status(400).json({ message: 'Missing userId or hash' });

  try {
    const db = await connectToDatabase();

    const wallet = await WalletBuilder.build(
      'https://indexer.testnet-02.midnight.network/api/v1/graphql',
      'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws',
      'http://localhost:9999', // 👈 Make sure Docker node is running here
      'https://rpc.testnet-02.midnight.network',
      process.env.SEED_HEX,
      NetworkId.TestNet,
      'info'
    );

    await wallet.start();

    // Create dummy metadata to simulate anchoring
    const metadata = {
      type: 'chat_anchor',
      timestamp: new Date().toISOString(),
      sha256: hash
    };

    // Simulate a blockchain interaction by storing metadata only
    const txId = `tx-${Date.now()}`; // Replace with real tx when full support is available

    await db.collection('anchors').insertOne({
      userId,
      hash,
      metadata,
      txId,
      createdAt: new Date()
    });

    res.status(200).json({ message: 'Smart contract (mock) anchored', txId });
  } catch (err) {
    console.error('❌ Error anchoring to Midnight:', err);
    res.status(500).json({ error: 'Failed to anchor hash' });
  }
});

export default router;
