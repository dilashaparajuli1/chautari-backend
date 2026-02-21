import { Router } from 'express';
import { User, userToResponse } from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

export const usersRouter = Router();
usersRouter.use(requireAuth);

usersRouter.get('/me', (req, res) => {
  res.json(req.user);
});

usersRouter.patch('/me', async (req, res) => {
  const { name, email } = req.body;
  const updates = {};
  if (name !== undefined) {
    const t = String(name).trim();
    if (t.length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters' });
    }
    updates.name = t;
  }
  if (email !== undefined) {
    const e = String(email).toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      return res.status(400).json({ error: 'Invalid email' });
    }
    const other = await User.findOne({ email: e, _id: { $ne: req.user.id } });
    if (other) {
      return res.status(409).json({ error: 'This email is already in use' });
    }
    updates.email = e;
  }
  if (Object.keys(updates).length === 0) {
    return res.json(req.user);
  }
  const userRow = await User.findByIdAndUpdate(
    req.user.id,
    { $set: updates },
    { new: true }
  );
  if (!userRow) return res.status(401).json({ error: 'User not found' });
  res.json(userToResponse(userRow));
});
