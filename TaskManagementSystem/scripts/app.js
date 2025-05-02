const { BehaviorSubject } = rxjs;

// DOM References
const modal = document.getElementById('taskModal');
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.querySelector('.close-modal');
const taskForm = document.getElementById('taskForm');

// RxJS Store
const taskSubject = new BehaviorSubject(
  JSON.parse(localStorage.getItem('tasks')) || []
);

const getTasks = () => taskSubject.getValue();

const setTasks = (tasks) => {
  taskSubject.next(tasks);
  localStorage.setItem('tasks', JSON.stringify(tasks));
};

const addTask = (task) => setTasks([...getTasks(), task]);

const updateTask = (id, updates) => {
  const tasks = getTasks().map(task =>
    task.id === id ? { ...task, ...updates } : task
  );
  setTasks(tasks);
};

const deleteTask = (id) => {
  const tasks = getTasks().filter(task => task.id !== id);
  setTasks(tasks);
};

// Task Class
class Task {
  constructor({ title, description, dueDate, priority, status = 'todo', id = Date.now() }) {
    this.title = title;
    this.description = description || '';
    this.dueDate = dueDate;
    this.priority = priority;
    this.status = status;
    this.id = id;
  }

  static createFromForm({ taskTitle, taskDesc, taskDueDate, taskPriority }, status = 'todo') {
    return new Task({
      title: taskTitle.value,
      description: taskDesc.value,
      dueDate: taskDueDate.value,
      priority: taskPriority.value,
      status: status
    });
  }

  getFormattedDueDate() {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(this.dueDate).toLocaleDateString('en-US', options);
  }
}

const DOM = {
  openModal: () => {
    modal.classList.add('show');
    document.getElementById('taskTitle').focus();
  },
  closeModal: () => modal.classList.remove('show'),
  clearTasks: () => document.querySelectorAll('.task').forEach(t => t.remove()),
  createTaskElement: (task) => {
    const t = new Task(task);
    const el = document.createElement('div');
    el.className = `task ${t.priority}`;
    el.dataset.id = t.id;
    el.draggable = true;
    el.innerHTML = `
      <div class="task-header">
        <span class="task-title">${t.title}</span>
        <span class="priority-badge ${t.priority}">${t.priority}</span>
      </div>
      ${t.description ? `<p class="task-desc">${t.description}</p>` : ''}
      <span class="task-due">Due: ${t.getFormattedDueDate()}</span>
      <div class="actions">
        <button class="complete">✔ Complete</button>
        <button class="edit">✏ Edit</button>
        <button class="delete">❌ Delete</button>
      </div>
    `;
    el.addEventListener('dragstart', handleDragStart);
    return el;
  },
  renderTasks: (tasks) => {
    DOM.clearTasks();
    const byStatus = tasks.reduce((acc, t) => {
      acc[t.status] = acc[t.status] || [];
      acc[t.status].push(t);
      return acc;
    }, {});
    Object.entries(byStatus).forEach(([status, taskList]) => {
      const col = document.getElementById(status);
      taskList.forEach(t => col.appendChild(DOM.createTaskElement(t)));
    });
  }
};

// Drag & Drop Setup
function handleDragStart(e) {
  e.dataTransfer.setData('text/plain', e.target.dataset.id);
}

function setupDragAndDrop() {
  document.querySelectorAll('.column').forEach(col => {
    col.addEventListener('dragover', (e) => e.preventDefault());
    col.addEventListener('drop', (e) => {
      e.preventDefault();
      const id = parseInt(e.dataTransfer.getData('text/plain'));
      const newStatus = col.id;
      const task = getTasks().find(t => t.id === id);
      if (task && task.status !== newStatus) updateTask(id, { status: newStatus });
    });
  });
}

// Form Handling
let isEditing = false;
let currentEditingId = null;

openModalBtn.addEventListener('click', DOM.openModal);
closeModalBtn.addEventListener('click', DOM.closeModal);

taskForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const elements = this.elements;
  const formData = Task.createFromForm(elements);

  if (isEditing && currentEditingId) {
    formData.id = currentEditingId;
    const original = getTasks().find(t => t.id === currentEditingId);
    formData.status = original?.status || 'todo';
    updateTask(currentEditingId, formData);
  } else {
    addTask(formData);
  }

  this.reset();
  DOM.closeModal();
  isEditing = false;
  currentEditingId = null;
});

// Handle task actions
addEventListener('click', (e) => {
  const el = e.target.closest('.task');
  if (!el) return;
  const id = parseInt(el.dataset.id);
  const task = getTasks().find(t => t.id === id);
  if (!task) return;

  if (e.target.classList.contains('delete')) deleteTask(id);
  if (e.target.classList.contains('complete')) updateTask(id, { status: 'done' });
  if (e.target.classList.contains('edit')) {
    isEditing = true;
    currentEditingId = id;
    taskForm.taskTitle.value = task.title;
    taskForm.taskDesc.value = task.description;
    taskForm.taskDueDate.value = task.dueDate;
    taskForm.taskPriority.value = task.priority;
    DOM.openModal();
  }
});

// Subscribe to taskSubject
setupDragAndDrop();
taskSubject.subscribe(DOM.renderTasks);
