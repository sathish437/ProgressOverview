import sequelize from '../config/database.js';
import '../models/index.js';

const syncDB = async () => {
    try {
        // Create database if not exists (This requires a connection to a generic DB first often, but MySQL's connector handles it differently depending on config)
        // For simplicity, we assume the DB is created or we use sync({force: true}) for dev
        console.log('Synchronizing database...');
        await sequelize.sync({ alter: true });
        console.log('Database synchronized successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Failed to synchronize database:', error);
        process.exit(1);
    }
};

syncDB();
