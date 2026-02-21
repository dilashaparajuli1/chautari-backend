import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDb } from './db/connect.js';
import { authRouter } from './routes/auth.js';
import { usersRouter } from './routes/users.js';
import { entriesRouter } from './routes/entries.js';
import { adminRouter } from './routes/admin.js';

const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const app = express();
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/entries', entriesRouter);
app.use('/api/admin', adminRouter);

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

async function start() {
  try {
    await connectDb();
    app.listen(PORT, () => {
      console.log(`Chautari backend running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

start();
