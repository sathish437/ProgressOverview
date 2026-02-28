import express from 'express';
import { Goal, Milestone } from '../models/index.js';
import { Op } from 'sequelize';

const router = express.Router();

console.log('--- DBG: goals.js router initialized ---');

// GET /api/goals
router.get('/', async (req, res) => {
    console.log('--- DBG: GET /api/goals hit ---');
    try {
        const goals = await Goal.findAll({
            where: { userId: req.userId },
            include: [{ model: Milestone, as: 'milestones' }]
        });
        res.json(goals);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch goals' });
    }
});

// POST /api/goals
router.post('/', async (req, res) => {
    try {
        const newGoal = await Goal.create({
            ...req.body,
            userId: req.userId
        });
        res.status(201).json(newGoal);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create goal' });
    }
});

// PATCH /api/goals/:id
router.patch('/:id', async (req, res) => {
    try {
        const goal = await Goal.findOne({
            where: { id: req.params.id, userId: req.userId },
            include: [{ model: Milestone, as: 'milestones' }]
        });

        if (!goal) return res.status(404).json({ error: 'Goal not found' });

        const { title, targetValue, currentValue, milestones } = req.body;

        // Update goal attributes
        await goal.update({ title, targetValue, currentValue });

        if (milestones && Array.isArray(milestones)) {
            // Identify milestones with real IDs vs temp IDs
            const incomingWithIds = milestones.filter(m => typeof m.id === 'number');
            const incomingIds = incomingWithIds.map(m => m.id);

            // 1. Delete milestones that are no longer in the list
            await Milestone.destroy({
                where: {
                    goalId: goal.id,
                    id: { [Op.notIn]: incomingIds }
                }
            });

            // 2. Update or Create milestones
            for (const mData of milestones) {
                if (typeof mData.id === 'number') {
                    // Update existing
                    await Milestone.update(
                        { ...mData, id: undefined, goalId: undefined }, // Don't try to update foreign keys/primary keys
                        { where: { id: mData.id, goalId: goal.id } }
                    );
                } else {
                    // Create new (temp IDs from frontend are strings)
                    await Milestone.create({
                        ...mData,
                        id: undefined, // Let DB generate ID
                        goalId: goal.id
                    });
                }
            }
        }

        // Return goal with refreshed milestones
        const updatedGoal = await Goal.findByPk(goal.id, {
            include: [{ model: Milestone, as: 'milestones' }]
        });

        res.json(updatedGoal);
    } catch (error) {
        console.error('GOAL UPDATE ERROR:', error);
        res.status(500).json({ error: 'Failed to update goal and milestones' });
    }
});

// DELETE /api/goals/:id
router.delete('/:id', async (req, res) => {
    try {
        await Goal.destroy({ where: { id: req.params.id, userId: req.userId } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete goal' });
    }
});

// --- Milestone Routes (Nested) ---
router.post('/:goalId/milestones', async (req, res) => {
    try {
        const goal = await Goal.findOne({ where: { id: req.params.goalId, userId: req.userId } });
        if (!goal) return res.status(404).json({ error: 'Goal not found' });

        const milestone = await Milestone.create({
            ...req.body,
            goalId: goal.id
        });
        res.status(201).json(milestone);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create milestone' });
    }
});

export default router;
