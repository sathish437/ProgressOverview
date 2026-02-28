import express from 'express';
import { Task, Habit, HabitHistory, Learning } from '../models/index.js';
import { Op } from 'sequelize';
import { startOfWeek, endOfWeek, eachDayOfInterval, format } from 'date-fns';

const router = express.Router();

router.get('/weekly', async (req, res) => {
    try {
        console.log(`Fetching weekly stats for user: ${req.userId}`);
        const today = new Date();
        const start = startOfWeek(today, { weekStartsOn: 1 });
        const end = endOfWeek(today, { weekStartsOn: 1 });

        const days = eachDayOfInterval({ start, end });
        const stats = [];

        for (const day of days) {
            const dateStr = format(day, 'yyyy-MM-dd');

            // 1. Tasks: Completed on this specific day
            // Using [Op.between] for consistent date-time matching
            const tasksCount = await Task.count({
                where: {
                    userId: req.userId,
                    status: 'DONE',
                    completedAt: {
                        [Op.between]: [
                            dateStr + ' 00:00:00',
                            dateStr + ' 23:59:59'
                        ]
                    }
                }
            });

            // 2. Habits: Find histories for this day linked to user's habits
            const habitsCount = await HabitHistory.count({
                include: [{
                    model: Habit,
                    required: true,
                    where: { userId: req.userId }
                }],
                where: {
                    date: dateStr
                }
            });

            // 3. Learning: Count sessions for this user on this day
            const learningSessions = await Learning.count({
                where: {
                    userId: req.userId,
                    date: dateStr
                }
            });

            stats.push({
                date: dateStr,
                tasks: tasksCount,
                habits: habitsCount,
                learning: learningSessions
            });
        }

        res.json(stats);
    } catch (error) {
        console.error('DASHBOARD ERROR:', error);
        res.status(500).json({
            error: 'Failed to fetch dashboard stats',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

export default router;
