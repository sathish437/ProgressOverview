import sequelize from '../config/database.js';
import '../models/index.js';

async function syncDb() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Connected.');

        console.log('Syncing models with alter: true...');
        await sequelize.sync({ alter: true });
        console.log('Database synced successfully!');
    } catch (err) {
        console.error('Failed to sync database:', err);
    } finally {
        process.exit();
    }
}

syncDb();
