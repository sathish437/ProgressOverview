import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

export const auth = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.warn('AUTH FAILED: No token provided in headers');
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Verify user still exists in DB
        const user = await User.findByPk(decoded.userId);
        if (!user) {
            console.warn(`AUTH FAILED: User ${decoded.userId} no longer exists.`);
            return res.status(401).json({ error: 'Session expired. User no longer exists.' });
        }

        req.userId = decoded.userId;
        // console.debug(`AUTH SUCCESS: User ${req.userId} authenticated`);
        next();
    } catch (error) {
        console.error('Auth Middleware error:', error.message);
        res.status(403).json({ error: 'Invalid or expired token.' });
    }
};
