import { Router } from 'express';
import { Entry, entryToResponse } from '../models/Entry.js';
import { User, userToResponse } from '../models/User.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

export const adminRouter = Router();
adminRouter.use(requireAuth);
adminRouter.use(requireAdmin);

// ----- Entries -----

adminRouter.get('/entries', async (req, res) => {
  const list = await Entry.find()
    .sort({ createdAt: -1 })
    .populate('user', 'name email')
    .lean();
  const entries = list.map((e) => {
    const user = e.user;
    return entryToResponse(e, user);
  });
  res.json(entries);
});

adminRouter.patch('/entries/:id', async (req, res) => {
  const entry = await Entry.findById(req.params.id);
  if (!entry) {
    return res.status(404).json({ error: 'Entry not found' });
  }
  const { body, chakraId } = req.body;
  if (body !== undefined) {
    const t = String(body).trim();
    if (!t) return res.status(400).json({ error: 'Body cannot be empty' });
    entry.body = t;
  }
  if (chakraId !== undefined) {
    entry.chakra_id = chakraId === null ? null : String(chakraId);
  }
  await entry.save();
  res.json(entryToResponse(entry));
});

adminRouter.delete('/entries/:id', async (req, res) => {
  const result = await Entry.deleteOne({ _id: req.params.id });
  if (result.deletedCount === 0) {
    return res.status(404).json({ error: 'Entry not found' });
  }
  res.status(204).send();
});

// ----- Users -----

adminRouter.get('/users', async (_req, res) => {
  const list = await User.find().sort({ createdAt: -1 });
  res.json(list.map((u) => userToResponse(u)));
});

adminRouter.patch('/users/:id', async (req, res) => {
  const { name, email, role } = req.body;
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
    const other = await User.findOne({ email: e, _id: { $ne: req.params.id } });
    if (other) {
      return res.status(409).json({ error: 'This email is already in use' });
    }
    updates.email = e;
  }

  if (role !== undefined) {
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    updates.role = role;
  }

  if (Object.keys(updates).length === 0) {
    const current = await User.findById(req.params.id);
    if (!current) return res.status(404).json({ error: 'User not found' });
    return res.json(userToResponse(current));
  }

  const updated = await User.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true }
  );
  if (!updated) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(userToResponse(updated));
});

adminRouter.delete('/users/:id', async (req, res) => {
  const id = req.params.id;

  if (String(req.user.id) === String(id)) {
    return res.status(400).json({ error: 'Admins cannot delete their own account' });
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  await Entry.deleteMany({ user: id });
  res.status(204).send();
});

// ----- Stats -----

adminRouter.get('/stats', async (_req, res) => {
  const total = await Entry.countDocuments();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const reflectionsToday = await Entry.countDocuments({
    createdAt: { $gte: todayStart },
  });
  res.json({
    totalReflections: total,
    reflectionsToday,
  });
});
