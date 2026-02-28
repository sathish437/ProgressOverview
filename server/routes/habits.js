import express from 'express';
import { Habit, HabitHistory } from '../models/index.js';

const router = express.Router();

// GET /api/habits
router.get('/', async (req, res) => {
    try {
        const habits = await Habit.findAll({
            where: { userId: req.userId },
            include: [{ model: HabitHistory, as: 'history' }]
        });
        res.json(habits);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch habits' });
    }
});

// POST /api/habits
router.post('/', async (req, res) => {
    try {
        console.log(`CREATING HABIT for user: ${req.userId}`, req.body);
        const habit = await Habit.create({
            ...req.body,
            userId: req.userId
        });
        res.status(201).json(habit);
    } catch (error) {
        console.error('HABIT CREATION ERROR:', error);
        res.status(500).json({
            error: 'Failed to create habit',
            details: error.message,
            errors: error.errors // Sequelize validation errors
        });
    }
});

// PATCH /api/habits/:id
router.patch('/:id', async (req, res) => {
    try {
        const habit = await Habit.findOne({ where: { id: req.params.id, userId: req.userId } });
        if (!habit) return res.status(404).json({ error: 'Habit not found' });

        await habit.update(req.body);
        res.json(habit);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update habit' });
    }
});

// DELETE /api/habits/:id
router.delete('/:id', async (req, res) => {
    try {
        console.log(`DELETING HABIT: ${req.params.id} for user: ${req.userId}`);
        const result = await Habit.destroy({ where: { id: req.params.id, userId: req.userId } });
        if (!result) {
            console.warn(`DELETE FAILED: Habit ${req.params.id} not found for user ${req.userId}`);
            return res.status(404).json({ error: 'Habit not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('DELETE ERROR:', error);
        res.status(500).json({ error: 'Failed to delete habit' });
    }
});

// POST /api/habits/:id/checkin
router.post('/:id/checkin', async (req, res) => {
    try {
        const habit = await Habit.findOne({ where: { id: req.params.id, userId: req.userId } });
        if (!habit) return res.status(404).json({ error: 'Habit not found' });

        const { date, value } = req.body;
        const [history, created] = await HabitHistory.findOrCreate({
            where: { habitId: habit.id, date },
            defaults: { value }
        });

        if (!created) {
            await history.update({ value });
        } else {
            // Update streak
            await habit.increment('streak');
        }

        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to checkin habit' });
    }
});

export default router;
