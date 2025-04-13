import express from 'express';
import bcrypt from 'bcrypt';
import { connectToDatabase } from '../utils/db.js';
import { WalletBuilder } from '@midnight-ntwrk/wallet';
import { NetworkId } from '@midnight-ntwrk/zswap';
import { generateRandomSeed } from '@midnight-ntwrk/wallet-sdk-hd';
import { ObjectId } from 'mongodb';

const router = express.Router();


function toHexString(buffer) {
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// POST /api/create-account
router.post('/create-account', async (req, res) => {
  const { email, password } = req.body;

  try {
    const db = await connectToDatabase();
    const users = db.collection('users');

    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create Midnight wallet
    const seedBytes = generateRandomSeed();
    const seedHex = toHexString(seedBytes);

    const wallet = await WalletBuilder.build(
      'https://indexer.testnet-02.midnight.network/api/v1/graphql',
      'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws',
      'http://localhost:9999',
      'https://rpc.testnet-02.midnight.network',
      seedHex,
      NetworkId.TestNet,
      'info'
    );

    await wallet.start();

    const walletState = await new Promise((resolve) => {
      wallet.state().subscribe((state) => {
        resolve(state);
      });
    });

    const result = await users.insertOne({
      email,
      password: hashedPassword,
      wallet: {
        seedHex,
        address: walletState.address,
      },
    });

    res.status(200).json({ message: 'Account created', userId: result.insertedId });
  } catch (err) {
    console.error('❌ Error creating account:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const db = await connectToDatabase();
    const users = db.collection('users');

    const user = await users.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    res.status(200).json({ 
        message: 'Login successful', 
        userId: user._id, 
        email: user.email,
        wallet: user.wallet  // Optional, for wallet info
      });
      
  } catch (err) {
    console.error('❌ Error logging in:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/user/:id
router.get('/user/:id', async (req, res) => {
    const { id } = req.params;
    console.log('👉 Requested user ID:', id);
  
    try {
      const db = await connectToDatabase();
      const users = db.collection('users');
  
      const user = await users.findOne({ _id: new ObjectId(id) });  // 👈 possible crash line
  
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      res.status(200).json({
        email: user.email,
        wallet: user.wallet,
      });
    } catch (err) {
      console.error('❌ Error fetching user:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

export default router;