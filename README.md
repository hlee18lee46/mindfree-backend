# 🧠 MindFree.AI – Node.js Backend (Blockchain Anchoring Server)

This is the Node.js backend server for **MindFree.AI**, focused on simulating blockchain anchoring using the Midnight SDK. It receives hashed emotion data from the FastAPI backend and stores anchor metadata to MongoDB, mimicking a smart contract interaction.

---

## 🌐 Server Details

| Service        | URL                      | Description                                     |
|----------------|--------------------------|-------------------------------------------------|
| Backend API    | http://localhost:6300    | Node.js Express server for anchoring            |
| Midnight Node  | http://localhost:9999    | Blockchain devnet node (Docker container)       |

---

## 🚀 Features

- Receives **SHA-256 hashed emotion logs** from the FastAPI backend
- Uses Midnight's **WalletBuilder SDK** to simulate wallet-based anchoring
- Stores anchor logs to **MongoDB**
- Contains a mock implementation of **smart contract anchoring**
- Fetches all anchors per user

---

## 📦 NPM Packages Used

| Package                        | Purpose                                         |
|-------------------------------|-------------------------------------------------|
| `express`                     | HTTP server framework                          |
| `dotenv`                      | Loads `.env` file for API keys and DB configs  |
| `cors`                        | Cross-origin resource sharing support          |
| `mongodb`                     | MongoDB client                                 |
| `@midnight-ntwrk/wallet`      | Midnight wallet management SDK                 |
| `@midnight-ntwrk/zswap`       | Blockchain network ID support                  |
| `@midnight-ntwrk/wallet-sdk-hd`| HD wallet seed generation                     |

---

## 🧪 Example Anchor Endpoint (POST)

```bash
POST /api/midnight/anchor
Content-Type: application/json

{
  "userId": "USER_OBJECT_ID",
  "hash": "YOUR_SHA256_HASH"
}

## 🧾 Anchor History (GET)
```bash
GET /api/midnight/anchors/:userId

## 🧬 Wallet Creation Code
```bash
import { WalletBuilder } from '@midnight-ntwrk/wallet';
import { NetworkId } from '@midnight-ntwrk/zswap';
import { generateRandomSeed } from '@midnight-ntwrk/wallet-sdk-hd';

function toHexString(buffer) {
  return Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function generateWallet() {
  const seedBytes = generateRandomSeed();
  const seedHex = toHexString(seedBytes);

  const wallet = await WalletBuilder.build(
    'https://indexer.testnet-02.midnight.network/api/v1/graphql',
    'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws',
    'http://localhost:9999', // Midnight proof server Docker container
    'https://rpc.testnet-02.midnight.network',
    seedHex,
    NetworkId.TestNet,
    'info'
  );

  await wallet.start();

  const state = await new Promise(resolve => wallet.state().subscribe(resolve));
  return { seedHex, address: state.address };
}

## 📜 Smart Contract in Compact DSL
```bash
contract anchor_text {
  private field text_hash: Field

  def initialize(hash: Field):
    text_hash = hash

  def update_hash(new_hash: Field):
    text_hash = new_hash

  def get_hash(): Field
    return text_hash
}

##🐳 Running the Midnight Node with Docker
```bash

docker pull midnightnetwork/proof-server:latest

# Run node on port 9999 (maps to internal 6300)
docker run -p 9999:6300 midnightnetwork/proof-server -- 'midnight-proof-server --network testnet'

## 🛠️ How to Run Locally
```bash
npm install

# 	2.	Add .env file:
```bash
MONGO_URI=mongodb+srv://yourcluster
SEED_HEX=<generated_wallet_seed>

# 	3.	Start the server:
```bash
node index.js

# 🔒 Notes
	•	Lace Wallet extension is not fully functional due to current limitations in Cardano’s browser wallet detection.
	•	All blockchain writes are simulated for privacy-preserving UX and development testing.

⸻
