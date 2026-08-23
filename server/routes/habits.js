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
        console.error('Error fetching habits:', error);
        res.status(500).json({ error: 'Failed to fetch habits' });
    }
});

// POST /api/habits
router.post('/', async (req, res) => {
    try {
        const habit = await Habit.create({
            ...req.body,
            userId: req.userId
        });
        res.status(201).json(habit);
    } catch (error) {
        console.error('HABIT CREATION ERROR:', error);
        res.status(500).json({
            error: 'Failed to create habit',
            details: error.message
        });
    }
});

// PATCH /api/habits/:id
router.patch('/:id', async (req, res) => {
    try {
        const targetId = req.params.id;
        if (isNaN(Number(targetId))) {
            return res.status(200).json({ message: 'Habit updated locally', id: targetId });
        }

        const habit = await Habit.findOne({ where: { id: targetId, userId: req.userId } });
        if (!habit) return res.status(200).json({ message: 'Habit not in DB', id: targetId });

        await habit.update(req.body);
        res.json(habit);
    } catch (error) {
        console.error('Error updating habit:', error);
        res.status(500).json({ error: 'Failed to update habit' });
    }
});

// DELETE /api/habits/:id
router.delete('/:id', async (req, res) => {
    try {
        const targetId = req.params.id;
        if (isNaN(Number(targetId))) {
            return res.status(204).send();
        }

        await Habit.destroy({ where: { id: targetId, userId: req.userId } });
        res.status(204).send();
    } catch (error) {
        console.error('DELETE ERROR:', error);
        res.status(500).json({ error: 'Failed to delete habit' });
    }
});

// POST /api/habits/:id/checkin
router.post('/:id/checkin', async (req, res) => {
    try {
        const targetId = req.params.id;
        if (isNaN(Number(targetId))) {
            return res.status(200).json({ message: 'Checked in locally', id: targetId });
        }

        const habit = await Habit.findOne({ where: { id: targetId, userId: req.userId } });
        if (!habit) return res.status(200).json({ message: 'Habit not in DB', id: targetId });

        const { date, value } = req.body;
        const [history, created] = await HabitHistory.findOrCreate({
            where: { habitId: habit.id, date },
            defaults: { value }
        });

        if (!created) {
            await history.update({ value });
        } else {
            await habit.increment('streak');
        }

        res.json(history);
    } catch (error) {
        console.error('Error checking in habit:', error);
        res.status(500).json({ error: 'Failed to checkin habit' });
    }
});

export default router;
