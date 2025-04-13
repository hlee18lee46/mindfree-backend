import express from 'express';
import crypto from 'crypto';
import { connectToDatabase } from '../utils/db.js';
import { WalletBuilder } from '@midnight-ntwrk/wallet';
import { NetworkId } from '@midnight-ntwrk/zswap';

const router = express.Router();

router.post('/', async (req, res) => {
  const { userId, conversation } = req.body;

  if (!userId || !conversation) {
    return res.status(400).json({ message: 'Missing userId or conversation' });
  }

  try {
    // 1️⃣ Generate SHA-256 hash of the chat conversation
    const hash = crypto.createHash('sha256').update(conversation).digest('hex');

    // 2️⃣ Fetch wallet info from DB (assumes seedHex is stored with user)
    const db = await connectToDatabase();
    const user = await db.collection('users').findOne({ _id: userId });

    if (!user?.wallet?.seedHex) {
      return res.status(404).json({ message: 'Wallet not found for user' });
    }

    // 3️⃣ Build Wallet and simulate anchoring
    const wallet = await WalletBuilder.build(
      'https://indexer.testnet-02.midnight.network/api/v1/graphql',
      'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws',
      'http://localhost:9999', // ZSwap Daemon
      'https://rpc.testnet-02.midnight.network',
      user.wallet.seedHex,
      NetworkId.TestNet,
      'info'
    );

    await wallet.start();

    console.log('🔐 Anchoring conversation hash (mock)...');
    console.log('Hash:', hash);

    // 4️⃣ Optionally save anchor entry in DB
    await db.collection('anchors').insertOne({
      userId,
      hash,
      createdAt: new Date(),
    });

    res.status(200).json({ message: 'Hash mock-anchored', hash });
  } catch (err) {
    console.error('❌ Anchor error:', err);
    res.status(500).json({ message: 'Failed to anchor', error: err.message });
  }
});

export default router;
