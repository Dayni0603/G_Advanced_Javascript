export class Task {
    constructor(title, description, dueDate, priority) {
        this.id = Date.now();
        this.title = title;
        this.description = description || '';
        this.dueDate = dueDate;
        this.priority = priority;
        this.status = 'todo';
    }

    get isOverdue() {
        return this.dueDate && new Date(this.dueDate) < new Date();
    }
}