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
import templateRoutes from './routes/template.js';
import { auth } from './middleware/auth.js';

import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 🔥 Fix __dirname (ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔥 Middleware
app.use(cors());
app.use(express.json());


// =======================
// ✅ PUBLIC ROUTES
// =======================
app.use('/api/auth', authRoutes);

app.get('/api/test-server', (req, res) => {
    console.log('--- DBG: /api/test-server hit ---');
    res.json({ message: "Server is reachable and picking up changes" });
});

// =======================
// ✅ HEALTH CHECK
// =======================
app.get('/api/health', async (req, res) => {
    try {
        await sequelize.authenticate();
        res.json({ ok: true, db: "connected" });
    } catch (error) {
        res.status(500).json({ ok: false, db: "failed", error: error.message });
    }
});

// =======================
// 🔒 PROTECTED ROUTES
// =======================
app.use('/api/users', auth, userRoutes);
app.use('/api/tasks', auth, taskRoutes);
app.use('/api/goals', auth, goalRoutes);
app.use('/api/habits', auth, habitRoutes);
app.use('/api/learning', auth, learningRoutes);
app.use('/api/settings', auth, settingRoutes);
app.use('/api/dashboard', auth, dashboardRoutes);
app.use('/api/template', auth, templateRoutes);
app.use('/api/reset', auth, templateRoutes);
app.use('/api/reset-template', auth, templateRoutes);
app.use('/api/productivity', auth, templateRoutes);


// =======================
// 🔥 SERVE FRONTEND (IMPORTANT)
// =======================
app.use(express.static(path.join(__dirname, '../client/dist')));

// React Router support
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});


// =======================
// 🚀 START SERVER
// =======================
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);

    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
        await sequelize.sync({ alter: true });
        console.log('Database schema synchronized successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
});