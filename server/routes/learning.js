import express from 'express';
import { Learning } from '../models/index.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const list = await Learning.findAll({ where: { userId: req.userId }, order: [['date', 'DESC']] });
        res.json(list);
    } catch (error) {
        console.error('Error fetching learning logs:', error);
        res.status(500).json({ error: 'Failed to fetch learning logs' });
    }
});

router.post('/', async (req, res) => {
    try {
        const log = await Learning.create({ ...req.body, userId: req.userId });
        res.status(201).json(log);
    } catch (error) {
        console.error('Error creating learning log:', error);
        res.status(500).json({ error: 'Failed to create learning log' });
    }
});

// PATCH /api/learning/:id
router.patch('/:id', async (req, res) => {
    try {
        const targetId = req.params.id;
        if (isNaN(Number(targetId))) {
            return res.status(200).json({ message: 'Log updated locally', id: targetId });
        }

        const item = await Learning.findOne({ where: { id: targetId, userId: req.userId } });
        if (!item) return res.status(200).json({ message: 'Log not in DB', id: targetId });

        await item.update(req.body);
        res.json(item);
    } catch (error) {
        console.error('Error updating learning log:', error);
        res.status(500).json({ error: 'Failed to update learning log' });
    }
});

// DELETE /api/learning/:id
router.delete('/:id', async (req, res) => {
    try {
        const targetId = req.params.id;
        if (isNaN(Number(targetId))) {
            return res.status(204).send();
        }

        await Learning.destroy({ where: { id: targetId, userId: req.userId } });
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting learning log:', error);
        res.status(500).json({ error: 'Failed to delete learning log' });
    }
});

export default router;
