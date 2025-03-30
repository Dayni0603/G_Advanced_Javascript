import { Task } from './task.js';
import { UI } from './ui.js';

export class TaskManager {
    constructor(ui) {
        this.tasks = [];
        this.ui = ui;
    }

    addTask(task) {
        this.tasks.push(task);
        this.saveTasks();
        this.ui.renderTasks();
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveTasks();
        this.ui.renderTasks();
    }

    completeTask(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            task.status = 'done';
            this.saveTasks();
            this.ui.renderTasks();
        }
    }

    editTask(taskId, newData) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            Object.assign(task, newData);
            this.saveTasks();
            this.ui.renderTasks();
        }
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.tasks = savedTasks.map(t => new Task(t.title, t.description, t.dueDate, t.priority));
    }
}