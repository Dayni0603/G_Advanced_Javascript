import { Task } from './task.js';

export class TaskManager {
    constructor() {
        this.tasks = [];
    }

    addTask(task) {
        this.tasks.push(task);
        this.saveTasks();
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveTasks();
    }

    completeTask(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            task.status = 'done';
            this.saveTasks();
        }
    }

    editTask(taskId, newData) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            Object.assign(task, newData);
            this.saveTasks();
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