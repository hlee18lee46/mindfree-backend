import { WalletBuilder } from '@midnight-ntwrk/wallet';
import { NetworkId } from '@midnight-ntwrk/zswap';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

async function deploy() {
  const contractPath = path.resolve('./contracts/anchor_text.compact');
  const contractCode = fs.readFileSync(contractPath, 'utf-8');

  const wallet = await WalletBuilder.build(
    'https://indexer.testnet-02.midnight.network/api/v1/graphql',
    'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws',
    'http://localhost:9999', // Your local node
    'https://rpc.testnet-02.midnight.network',
    process.env.SEED_HEX,
    NetworkId.TestNet,
    'info'
  );

  wallet.start();

  const result = await deployContract(wallet, {
    code: contractCode,
    arguments: ['0'], // Initial text_hash (Field)
    options: {
      name: 'anchor_text',
    },
  });

  console.log('✅ Contract deployed:', result);
}

deploy().catch((err) => {
  console.error('❌ Failed to deploy contract:', err);
});
