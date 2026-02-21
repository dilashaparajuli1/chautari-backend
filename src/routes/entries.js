import { Router } from 'express';
import { Entry, entryToResponse } from '../models/Entry.js';
import { requireAuth } from '../middleware/auth.js';

export const entriesRouter = Router();
entriesRouter.use(requireAuth);

entriesRouter.get('/', async (req, res) => {
  const list = await Entry.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .lean();
  res.json(list.map((e) => entryToResponse(e)));
});

entriesRouter.post('/', async (req, res) => {
  const { body, chakraId } = req.body;
  if (body === undefined || body === null) {
    return res.status(400).json({ error: 'Body is required' });
  }
  const bodyStr = String(body).trim();
  if (!bodyStr) {
    return res.status(400).json({ error: 'Body cannot be empty' });
  }
  const chakraIdVal = chakraId === undefined || chakraId === null ? null : String(chakraId);
  const entry = await Entry.create({
    user: req.user.id,
    body: bodyStr,
    chakra_id: chakraIdVal,
  });
  res.status(201).json(entryToResponse(entry));
});

entriesRouter.patch('/:id', async (req, res) => {
  const entry = await Entry.findOne({ _id: req.params.id, user: req.user.id });
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

entriesRouter.delete('/:id', async (req, res) => {
  const result = await Entry.deleteOne({ _id: req.params.id, user: req.user.id });
  if (result.deletedCount === 0) {
    return res.status(404).json({ error: 'Entry not found' });
  }
  res.status(204).send();
});
