import { Request, Response, NextFunction } from 'express';
import { createApp } from '../src/app';
import { connectDB } from '../src/config/db';

const app = createApp();

let isConnected = false;

app.use(async (req: Request, res: Response, next: NextFunction) => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (err) {
      console.error('MongoDB connection error in serverless:', err);
    }
  }
  next();
});

export default app;
