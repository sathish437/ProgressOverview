import express from 'express';
import { Setting } from '../models/index.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const settings = await Setting.findOne({ where: { userId: req.userId } });
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

router.put('/', async (req, res) => {
    try {
        const { weightsHabits, weightsTasks, weightsLearning } = req.body;
        if (weightsHabits + weightsTasks + weightsLearning !== 100) {
            return res.status(400).json({ error: 'Weights must sum to 100' });
        }

        let settings = await Setting.findOne({ where: { userId: req.userId } });
        if (!settings) {
            settings = await Setting.create({ ...req.body, userId: req.userId });
        } else {
            await settings.update(req.body);
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

export default router;
