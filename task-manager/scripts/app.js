import { UI } from './ui.js';
import { Task } from './task.js';
import { TaskManager } from './taskManager.js';

document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI();
    ui.renderTasks();

    const modal = document.getElementById('taskModal');
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.querySelector('.close-modal');
    const taskForm = document.getElementById('taskForm');
    
    openModalBtn.addEventListener('click', () => {
        modal.classList.add('show');
    });

    closeModalBtn.addEventListener('click', () => {
        modal.classList.remove('show');
    });

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const { taskTitle, taskDesc, taskDueDate, taskPriority } = taskForm.elements;
        const newTask = new Task(taskTitle.value, taskDesc.value, taskDueDate.value, taskPriority.value);
        
        ui.taskManager.addTask(newTask);
        ui.renderTasks();
        taskForm.reset();
        modal.classList.remove('show');
    });
});