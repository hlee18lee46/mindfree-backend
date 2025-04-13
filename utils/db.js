// db.js
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
let db;

export async function connectToDatabase() {
  if (!db) {
    await client.connect();
    db = client.db('mindfree'); // or any name you want
  }
  return db;
}