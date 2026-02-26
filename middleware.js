export default (req, res, next) => {
    if (req.method === 'GET' && req.url === '/summary') {
        const db = req.app.db; // lowdb instance
        const habits = db.get('habits').value() || [];
        const tasks = db.get('tasks').value() || [];
        const learning = db.get('learning').value() || [];

        const doneTasks = tasks.filter(t => t.status === 'DONE').length;
        const totalTasks = tasks.length;
        const today = new Date().toISOString().split('T')[0];
        const habitCompletionToday = habits.length > 0
            ? (habits.filter(h => h.history && h.history.some(entry => entry.date === today)).length / habits.length) * 100
            : 0;

        res.json({
            taskCompletion: totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0,
            habitScore: habitCompletionToday,
            learningMinutes: learning.reduce((acc, curr) => acc + (curr.minutes || 0), 0)
        });
    } else {
        next();
    }
};
