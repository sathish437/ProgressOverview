import express from 'express';
import { User, Setting } from '../models/index.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/users/me
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.userId, {
            attributes: { exclude: ['passwordHash'] },
            include: [{ model: Setting }]
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// PATCH /api/users/me
router.patch('/me', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const updates = req.body;
        // Don't allow password update through this simple PATCH
        delete updates.passwordHash;
        delete updates.email; // Email usually readonly in profile edit

        await user.update(updates);

        const updatedUser = user.toJSON();
        delete updatedUser.passwordHash;

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

export default router;
