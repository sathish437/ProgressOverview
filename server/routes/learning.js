import express from 'express';
import { Learning } from '../models/index.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const list = await Learning.findAll({ where: { userId: req.userId }, order: [['date', 'DESC']] });
        res.json(list);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch learning logs' });
    }
});

router.post('/', async (req, res) => {
    try {
        const log = await Learning.create({ ...req.body, userId: req.userId });
        res.status(201).json(log);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create learning log' });
    }
});

// PATCH /api/learning/:id
router.patch('/:id', async (req, res) => {
    try {
        const item = await Learning.findOne({ where: { id: req.params.id, userId: req.userId } });
        if (!item) return res.status(404).json({ error: 'Log not found' });

        await item.update(req.body);
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update learning log' });
    }
});

// DELETE /api/learning/:id
router.delete('/:id', async (req, res) => {
    try {
        const result = await Learning.destroy({ where: { id: req.params.id, userId: req.userId } });
        if (!result) return res.status(404).json({ error: 'Log not found' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete learning log' });
    }
});

export default router;
