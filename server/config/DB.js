import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const dbConnect = () => {
  mongoose.connect(process.env.MONGO_URL);
  const db = mongoose.connection;

  db.once('connected', () => {
    console.log('Connected to MongoDB');
  });

  db.on('error', (err) => {
    console.error(err);
  });
};
