import { Request, Response } from 'express';
import mongoose from 'mongoose';
import app from '../src/app';
import { env } from '../src/config/env';

let cachedDb: typeof mongoose | null = null;

const connectDB = async () => {
  if (cachedDb) {
    return cachedDb;
  }
  console.log('Connecting to MongoDB (Serverless)...');
  const conn = await mongoose.connect(env.MONGODB_URI);
  cachedDb = conn;
  return conn;
};

export default async function handler(req: Request, res: Response) {
  await connectDB();
  return app(req, res);
}
