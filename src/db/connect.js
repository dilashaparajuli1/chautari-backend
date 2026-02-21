import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

const ADMIN_EMAIL = 'admin@chautari.com';
const ADMIN_PASSWORD = 'Admin@123';

/** Database name to use (defaults to chautari if not in URI). */
const DB_NAME = process.env.MONGODB_DB_NAME || 'chautari';

export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set in environment. Add it to your .env file.');
  }

  const options = {
    dbName: DB_NAME,
    maxPoolSize: 10,
  };

  await mongoose.connect(uri, options);
  console.log('MongoDB connected to database:', DB_NAME);

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (!existing) {
    await User.create({
      email: ADMIN_EMAIL,
      password_hash: bcrypt.hashSync(ADMIN_PASSWORD, 10),
      name: 'Administrator',
      role: 'admin',
    });
    console.log('Seeded admin user:', ADMIN_EMAIL);
  }
}
