import { format } from 'date-fns';

export const storageService = {
    exportDataPDF: (data, user) => {
        const reportDate = format(new Date(), 'MMMM d, yyyy');
        const habits = data.habits || [];
        const tasks = data.tasks || [];
        const goals = data.goals || [];
        const learning = data.learning || [];
        const settings = data.settings || {};

        const totalTasks = tasks.length;
        const doneTasks = tasks.filter(t => t.status === 'DONE').length;
        const totalMinutesLearning = learning.reduce((sum, l) => sum + (Number(l.minutes) || 0), 0);

        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Productivity Report - ${reportDate}</title>
    <style>
        @page {
            size: A4;
            margin: 15mm;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #111827;
            background: #fff;
            line-height: 1.5;
            font-size: 13px;
            margin: 0;
            padding: 0;
        }
        .header {
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 15px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }
        .title {
            font-size: 24px;
            font-weight: 800;
            color: #1e3a8a;
            margin: 0;
            letter-spacing: -0.5px;
        }
        .meta {
            color: #6b7280;
            font-size: 12px;
        }
        .user-badge {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            color: #1d4ed8;
            padding: 4px 10px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 12px;
            display: inline-block;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 25px;
        }
        .stat-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px;
        }
        .stat-label {
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 700;
        }
        .stat-value {
            font-size: 20px;
            font-weight: 800;
            color: #0f172a;
            margin-top: 4px;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 15px;
            font-weight: 700;
            color: #1e293b;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 6px;
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
        }
        th, td {
            text-align: left;
            padding: 8px 10px;
            border-bottom: 1px solid #f1f5f9;
        }
        th {
            background-color: #f8fafc;
            color: #475569;
            font-weight: 600;
            border-top: 1px solid #e2e8f0;
            border-bottom: 1px solid #e2e8f0;
        }
        .status-badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
        }
        .status-done { background: #dcfce7; color: #166534; }
        .status-prog { background: #dbeafe; color: #1e40af; }
        .status-todo { background: #f1f5f9; color: #475569; }
        .footer {
            margin-top: 30px;
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
        }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <h1 class="title">Productivity Report</h1>
            <div class="meta">Comprehensive Activity & Metric Summary</div>
        </div>
        <div style="text-align: right;">
            <div class="user-badge">${user?.fullName || 'Alex Rivers'}</div>
            <div class="meta" style="margin-top: 4px;">${reportDate}</div>
        </div>
    </div>

    <div class="grid">
        <div class="stat-card">
            <div class="stat-label">Active Habits</div>
            <div class="stat-value">${habits.length}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Tasks Completed</div>
            <div class="stat-value">${doneTasks} / ${totalTasks}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Active Goals</div>
            <div class="stat-value">${goals.length}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Learning Time</div>
            <div class="stat-value">${Math.round(totalMinutesLearning / 60 * 10) / 10}h</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">
            <span>Habits Status</span>
            <span style="font-weight: normal; font-size: 12px; color: #64748b;">${habits.length} Tracked</span>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Habit Title</th>
                    <th>Category</th>
                    <th>Current Streak</th>
                    <th>Best Streak</th>
                    <th>Target / Day</th>
                </tr>
            </thead>
            <tbody>
                ${habits.map(h => `
                    <tr>
                        <td style="font-weight: 600;">${h.title}</td>
                        <td>${h.category || 'General'}</td>
                        <td>🔥 ${h.streak || 0} days</td>
                        <td>⚡ ${h.bestStreak || h.streak || 0} days</td>
                        <td>${h.targetPerDay || 1}/day</td>
                    </tr>
                `).join('')}
                ${habits.length === 0 ? '<tr><td colspan="5" style="text-align:center; color:#94a3b8;">No habits tracked</td></tr>' : ''}
            </tbody>
        </table>
    </div>

    <div class="section">
        <div class="section-title">
            <span>Kanban Tasks Overview</span>
            <span style="font-weight: normal; font-size: 12px; color: #64748b;">${doneTasks} Completed of ${totalTasks}</span>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Task Title</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                </tr>
            </thead>
            <tbody>
                ${tasks.map(t => `
                    <tr>
                        <td style="font-weight: 600;">${t.title}</td>
                        <td>
                            <span class="status-badge ${t.status === 'DONE' ? 'status-done' : t.status === 'IN_PROGRESS' ? 'status-prog' : 'status-todo'}">
                                ${t.status || 'TODO'}
                            </span>
                        </td>
                        <td>${t.priority || 'MED'}</td>
                        <td>${t.dueDate || 'No Date'}</td>
                    </tr>
                `).join('')}
                ${tasks.length === 0 ? '<tr><td colspan="4" style="text-align:center; color:#94a3b8;">No tasks logged</td></tr>' : ''}
            </tbody>
        </table>
    </div>

    <div class="section">
        <div class="section-title">
            <span>Goal Roadmaps</span>
            <span style="font-weight: normal; font-size: 12px; color: #64748b;">${goals.length} Goals</span>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Goal Title</th>
                    <th>Category</th>
                    <th>Progress</th>
                    <th>Milestones</th>
                </tr>
            </thead>
            <tbody>
                ${goals.map(g => {
            const milestones = g.milestones || [];
            const doneM = milestones.filter(m => m.done).length;
            const pct = Math.round((g.currentValue / (g.targetValue || 100)) * 100) || 0;
            return `
                        <tr>
                            <td style="font-weight: 600;">${g.title}</td>
                            <td>${g.category || 'General'}</td>
                            <td>${pct}% (${g.currentValue || 0}/${g.targetValue || 100})</td>
                            <td>${doneM} of ${milestones.length} Done</td>
                        </tr>
                    `;
        }).join('')}
                ${goals.length === 0 ? '<tr><td colspan="4" style="text-align:center; color:#94a3b8;">No goals logged</td></tr>' : ''}
            </tbody>
        </table>
    </div>

    <div class="section">
        <div class="section-title">
            <span>Focused Learning Logs</span>
            <span style="font-weight: normal; font-size: 12px; color: #64748b;">${totalMinutesLearning} Total Minutes</span>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Topic</th>
                    <th>Duration</th>
                    <th>Date</th>
                    <th>Key Takeaways</th>
                </tr>
            </thead>
            <tbody>
                ${learning.map(l => `
                    <tr>
                        <td style="font-weight: 600;">${l.topic}</td>
                        <td>${l.minutes} mins</td>
                        <td>${l.date}</td>
                        <td style="color: #475569;">${l.notes || '-'}</td>
                    </tr>
                `).join('')}
                ${learning.length === 0 ? '<tr><td colspan="4" style="text-align:center; color:#94a3b8;">No learning sessions logged</td></tr>' : ''}
            </tbody>
        </table>
    </div>

    <div class="footer">
        Generated automatically by Productivity & Growth Tracker • Backed by Neon PostgreSQL
    </div>
</body>
</html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.open();
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
            }, 350);
        }
    }
};
