import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database.js';
import './models/index.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import taskRoutes from './routes/tasks.js';
import goalRoutes from './routes/goals.js';
import habitRoutes from './routes/habits.js';
import learningRoutes from './routes/learning.js';
import settingRoutes from './routes/settings.js';
import dashboardRoutes from './routes/dashboard.js';
import { auth } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- Public Routes ---
app.use('/api/auth', authRoutes);

app.get('/api/test-server', (req, res) => {
    console.log('--- DBG: /api/test-server hit ---');
    res.json({ message: "Server is reachable and picking up changes" });
});

// --- Health Check ---
app.get('/api/health', async (req, res) => {
    try {
        await sequelize.authenticate();
        res.json({ ok: true, db: "connected" });
    } catch (error) {
        res.status(500).json({ ok: false, db: "failed", error: error.message });
    }
});

// --- Protected Routes ---
app.use('/api/users', auth, userRoutes);
app.use('/api/tasks', auth, taskRoutes);
app.use('/api/goals', auth, goalRoutes);
app.use('/api/habits', auth, habitRoutes);
app.use('/api/learning', auth, learningRoutes);
app.use('/api/settings', auth, settingRoutes);
app.use('/api/dashboard', auth, dashboardRoutes);

app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
});
