import sequelize from './config/database.js';
import { User } from './models/index.js';

async function checkUsers() {
    try {
        await sequelize.authenticate();
        const users = await User.findAll();
        console.log('--- USERS IN DATABASE ---');
        console.table(users.map(u => ({ id: u.id, email: u.email, fullName: u.fullName })));
    } catch (error) {
        console.error(error);
    } finally {
        process.exit();
    }
}

checkUsers();
