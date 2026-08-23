import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// --- User Model ---
export const User = sequelize.define('User', {
    fullName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false, validate: { isEmail: true } },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING },
    college: { type: DataTypes.STRING },
    department: { type: DataTypes.STRING },
    year: { type: DataTypes.STRING },
    avatarUrl: { type: DataTypes.STRING }
}, {
    timestamps: true
});

// --- Task Model ---
export const Task = sequelize.define('Task', {
    title: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: 'TODO' }, // TODO, IN_PROGRESS, REVIEW, DONE
    priority: { type: DataTypes.STRING, defaultValue: 'MED' }, // HIGH, MED, LOW
    description: { type: DataTypes.TEXT },
    dueDate: { type: DataTypes.STRING },
    tags: { type: DataTypes.JSON, defaultValue: [] },
    completedAt: { type: DataTypes.DATE }
});

// --- Goal Model ---
export const Goal = sequelize.define('Goal', {
    title: { type: DataTypes.STRING, allowNull: false },
    targetValue: { type: DataTypes.INTEGER, defaultValue: 100 },
    currentValue: { type: DataTypes.INTEGER, defaultValue: 0 },
    category: { type: DataTypes.STRING },
    deadline: { type: DataTypes.STRING }
});

// --- Milestone Model ---
export const Milestone = sequelize.define('Milestone', {
    title: { type: DataTypes.STRING, allowNull: false },
    value: { type: DataTypes.INTEGER, defaultValue: 0 },
    done: { type: DataTypes.BOOLEAN, defaultValue: false },
    isCustom: { type: DataTypes.BOOLEAN, defaultValue: false },
    completedAt: { type: DataTypes.DATE }
});

// --- Habit Model ---
export const Habit = sequelize.define('Habit', {
    title: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.STRING },
    targetPerDay: { type: DataTypes.INTEGER, defaultValue: 1 },
    streak: { type: DataTypes.INTEGER, defaultValue: 0 },
    bestStreak: { type: DataTypes.INTEGER, defaultValue: 0 }
});

// --- Habit History Model ---
export const HabitHistory = sequelize.define('HabitHistory', {
    date: { type: DataTypes.STRING, allowNull: false },
    value: { type: DataTypes.INTEGER, defaultValue: 0 }
});

// --- Learning Model ---
export const Learning = sequelize.define('Learning', {
    topic: { type: DataTypes.STRING, allowNull: false },
    minutes: { type: DataTypes.INTEGER, defaultValue: 0 },
    date: { type: DataTypes.STRING, allowNull: false },
    notes: { type: DataTypes.TEXT }
});

// --- Setting Model ---
export const Setting = sequelize.define('Setting', {
    weightsHabits: { type: DataTypes.INTEGER, defaultValue: 40 },
    weightsTasks: { type: DataTypes.INTEGER, defaultValue: 40 },
    weightsLearning: { type: DataTypes.INTEGER, defaultValue: 20 },
    learningDailyTargetMinutes: { type: DataTypes.INTEGER, defaultValue: 60 },
    theme: { type: DataTypes.STRING, defaultValue: 'dark' },
    accentColor: { type: DataTypes.STRING, defaultValue: 'blue' },
    showHabits: { type: DataTypes.BOOLEAN, defaultValue: true },
    showTasks: { type: DataTypes.BOOLEAN, defaultValue: true },
    showLearning: { type: DataTypes.BOOLEAN, defaultValue: true },
    showGoals: { type: DataTypes.BOOLEAN, defaultValue: true },
    showActivity: { type: DataTypes.BOOLEAN, defaultValue: true },
    overdueAlerts: { type: DataTypes.BOOLEAN, defaultValue: true },
    lowProgressAlerts: { type: DataTypes.BOOLEAN, defaultValue: true },
    lowProgressThreshold: { type: DataTypes.INTEGER, defaultValue: 50 }
});

// --- Associations ---
User.hasMany(Task, { foreignKey: 'userId', onDelete: 'CASCADE' });
Task.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Goal, { foreignKey: 'userId', onDelete: 'CASCADE' });
Goal.belongsTo(User, { foreignKey: 'userId' });

Goal.hasMany(Milestone, { foreignKey: 'goalId', as: 'milestones', onDelete: 'CASCADE' });
Milestone.belongsTo(Goal, { foreignKey: 'goalId' });

User.hasMany(Habit, { foreignKey: 'userId', onDelete: 'CASCADE' });
Habit.belongsTo(User, { foreignKey: 'userId' });

Habit.hasMany(HabitHistory, { foreignKey: 'habitId', as: 'history', onDelete: 'CASCADE' });
HabitHistory.belongsTo(Habit, { foreignKey: 'habitId' });

User.hasMany(Learning, { foreignKey: 'userId', onDelete: 'CASCADE' });
Learning.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(Setting, { foreignKey: 'userId', onDelete: 'CASCADE' });
Setting.belongsTo(User, { foreignKey: 'userId' });

export default {
    User, Task, Goal, Milestone, Habit, HabitHistory, Learning, Setting
};
