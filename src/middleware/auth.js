import jwt from 'jsonwebtoken';
import { User, userToResponse } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

async function requireAuthAsync(req, res, next) {
  const auth = req.headers.authorization;
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const userDoc = await User.findById(payload.userId);
    if (!userDoc) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = userToResponse(userDoc);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireAuth(req, res, next) {
  requireAuthAsync(req, res, next).catch(next);
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

export function signToken(userId) {
  return jwt.sign(
    { userId: String(userId) },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}
