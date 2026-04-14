import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authMiddleware, adminMiddleware } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import phoneRoutes from './routes/phones.js';
import repairRoutes from './routes/repairs.js';
import messageRoutes from './routes/messages.js';
import userRoutes from './routes/users.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/phones', authMiddleware, phoneRoutes);
app.use('/api/phones/:id/repairs', authMiddleware, repairRoutes);
app.use('/api/messages', authMiddleware, messageRoutes);
app.use('/api/users', authMiddleware, adminMiddleware, userRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
