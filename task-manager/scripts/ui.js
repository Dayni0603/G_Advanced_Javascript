import { TaskManager } from './taskManager.js';

export class UI {
    constructor() {
        this.taskManager = new TaskManager();
        this.taskManager.loadTasks();
    }

    renderTasks() {
        document.querySelectorAll('.column').forEach(column => {
            column.innerHTML = `<h3>${column.id.replace(/([A-Z])/g, ' $1')}</h3>`;
        });

        this.taskManager.tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            document.getElementById(task.status).appendChild(taskElement);
        });
    }

    createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = `task ${task.priority}`;
        taskElement.dataset.id = task.id;
        taskElement.draggable = true;
        taskElement.innerHTML = `
            <div class="task-header">
                <span class="task-title">${task.title}</span>
                <span class="priority-badge ${task.priority}">${task.priority}</span>
            </div>
            ${task.description ? `<p class="task-desc">${task.description}</p>` : ''}
            <span class="task-due">Due: ${task.dueDate || 'No date'}</span>
            <div class="actions">
                <button class="complete">✔ Complete</button>
                <button class="edit">✏ Edit</button>
                <button class="delete">❌ Delete</button>
            </div>
        `;
        
        taskElement.querySelector('.delete').addEventListener('click', () => this.taskManager.deleteTask(task.id));
        taskElement.querySelector('.complete').addEventListener('click', () => this.taskManager.completeTask(task.id));
        return taskElement;
    }
}