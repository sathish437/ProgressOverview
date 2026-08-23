import express from 'express';
import sequelize from '../config/database.js';
import { Task, Goal, Milestone, Habit, HabitHistory, Learning, Setting } from '../models/index.js';

const router = express.Router();

const handleResetProductivityData = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const userId = req.userId;
        if (!userId) {
            await transaction.rollback();
            return res.status(401).json({ error: 'Unauthorized. User identification required.' });
        }

        // 1. Delete ONLY this authenticated user's dependent child records
        const existingGoals = await Goal.findAll({ where: { userId }, attributes: ['id'], transaction });
        const goalIds = existingGoals.map(g => g.id);
        if (goalIds.length > 0) {
            await Milestone.destroy({ where: { goalId: goalIds }, transaction });
        }

        const existingHabits = await Habit.findAll({ where: { userId }, attributes: ['id'], transaction });
        const habitIds = existingHabits.map(h => h.id);
        if (habitIds.length > 0) {
            await HabitHistory.destroy({ where: { habitId: habitIds }, transaction });
        }

        // 2. Delete ONLY this user's primary productivity records
        await Goal.destroy({ where: { userId }, transaction });
        await Habit.destroy({ where: { userId }, transaction });
        await Task.destroy({ where: { userId }, transaction });
        await Learning.destroy({ where: { userId }, transaction });

        // 3. Ensure user settings exist with standard defaults (without inserting any fake productivity data)
        let settings = await Setting.findOne({ where: { userId }, transaction });
        if (!settings) {
            settings = await Setting.create({
                userId,
                weightsHabits: 40,
                weightsTasks: 40,
                weightsLearning: 20,
                learningDailyTargetMinutes: 60,
                theme: 'dark',
                accentColor: 'blue',
                showHabits: true,
                showTasks: true,
                showLearning: true,
                showGoals: true,
                overdueAlerts: true,
                lowProgressAlerts: true,
                lowProgressThreshold: 50
            }, { transaction });
        }

        // Commit transaction
        await transaction.commit();

        // 4. Return clean, empty state response directly to the frontend
        res.json({
            success: true,
            message: 'All productivity data has been reset and cleared successfully.',
            habits: [],
            tasks: [],
            goals: [],
            learning: [],
            settings
        });
    } catch (error) {
        await transaction.rollback();
        console.error('ERROR RESETTING PRODUCTIVITY DATA FOR USER:', error);
        res.status(500).json({ error: error.message || 'Failed to reset productivity data' });
    }
};

router.post('/reset', handleResetProductivityData);
router.delete('/reset', handleResetProductivityData);
router.post('/', handleResetProductivityData);
router.delete('/', handleResetProductivityData);

export default router;
