import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User, userToResponse } from '../models/User.js';
import { signToken } from '../middleware/auth.js';
import { sendEmail } from '../services/email.js';
import { buildWelcomeEmail } from '../emails/authEmails.js';

const ADMIN_EMAIL = 'admin@chautari.com';

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }
  const normalizedEmail = String(email).toLowerCase().trim();
  if (normalizedEmail === ADMIN_EMAIL) {
    return res.status(400).json({ error: 'This email is reserved for administration' });
  }
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }
  const nameTrimmed = String(name).trim();
  if (nameTrimmed.length < 2) {
    return res.status(400).json({ error: 'Name must be at least 2 characters' });
  }
  const hash = bcrypt.hashSync(password, 10);
  const newUser = await User.create({
    email: normalizedEmail,
    password_hash: hash,
    name: nameTrimmed,
    role: 'user',
  });

  const welcome = buildWelcomeEmail({ name: nameTrimmed });
  const emailResult = await sendEmail({
    to: normalizedEmail,
    subject: welcome.subject,
    text: welcome.text,
    html: welcome.html,
  });
  if (emailResult.status === 'failed') {
    console.warn('Welcome email failed:', emailResult.error);
  }

  const user = userToResponse(newUser);
  const token = signToken(newUser._id);
  res.status(201).json({ user, token, email: { welcome: emailResult.status } });
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const normalizedEmail = String(email).toLowerCase().trim();
  const row = await User.findOne({ email: normalizedEmail });
  if (!row) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const match = bcrypt.compareSync(password, row.password_hash);
  if (!match) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const user = userToResponse(row);
  const token = signToken(row._id);
  res.json({ user, token });
});
