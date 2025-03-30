// MODAL FUNCTIONALITY WITH DESTRUCTURING
const modal = document.getElementById('taskModal');
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.querySelector('.close-modal');
const taskForm = document.getElementById('taskForm');

// REACTIVE PROGRAMMING: Simple Observable Pattern
class TaskObservable {
  constructor() {
    this.subscribers = [];
    this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  notify() {
    this.subscribers.forEach(callback => callback(this.tasks));
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  getTasks() {
    return [...this.tasks];
  }

  addTask(task) {
    this.tasks.push(task);
    this.notify();
  }

  updateTask(id, updates) {
    this.tasks = this.tasks.map(task => 
      task.id === id ? {...task, ...updates} : task
    );
    this.notify();
  }

  deleteTask(id) {
    this.tasks = this.tasks.filter(task => task.id !== id);
    this.notify();
  }
}

// Create observable instance
const taskStore = new TaskObservable();

// OBJECT-ORIENTED PROGRAMMING: Task Class
class Task {
  constructor({ title, description, dueDate, priority, status = 'todo', id = Date.now() }) {
    this.title = title;
    this.description = description || '';
    this.dueDate = dueDate;
    this.priority = priority;
    this.status = status;
    this.id = id;
  }

  // Factory method using destructuring
  static createFromForm({ taskTitle, taskDesc, taskDueDate, taskPriority }, status = 'todo') {
    return new Task({
      title: taskTitle.value,
      description: taskDesc.value,
      dueDate: taskDueDate.value,
      priority: taskPriority.value,
      status: status
    });
  }

  // Method to format due date
  getFormattedDueDate() {
    if (!this.dueDate) return 'No date';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(this.dueDate).toLocaleDateString('en-US', options);
  }
}

// HIGHER-ORDER FUNCTIONS: Task operations
const taskOperations = {
  complete: (task) => ({ ...task, status: 'done' }),
  moveToInProgress: (task) => ({ ...task, status: 'inProgress' }),
  moveToTodo: (task) => ({ ...task, status: 'todo' }),
  update: (task, updates) => ({ ...task, ...updates })
};

// ASYNC PROGRAMMING: Simulate API calls
const taskAPI = {
  saveTasks: (tasks) => new Promise(resolve => {
    setTimeout(() => {
      localStorage.setItem('tasks', JSON.stringify(tasks));
      resolve(true);
    }, 500);
  }),
  
  fetchTasks: () => new Promise(resolve => {
    setTimeout(() => {
      const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      resolve(tasks);
    }, 500);
  })
};

// DOM OPERATIONS
const DOM = {
  // Open modal
  openModal: () => {
    modal.classList.add('show');
    document.getElementById('taskTitle').focus();
  },

  // Close modal
  closeModal: () => {
    modal.classList.remove('show');
  },

  // Clear all tasks from columns
  clearTasks: () => {
    document.querySelectorAll('.column').forEach(column => {
      column.querySelectorAll('.task').forEach(task => task.remove());
    });
  },

  // Create task HTML element with destructuring
  createTaskElement: (task) => {
    const taskObj = new Task(task);
    const taskElement = document.createElement('div');
    taskElement.className = `task ${taskObj.priority}`;
    taskElement.dataset.id = taskObj.id;
    taskElement.draggable = true;
    
    taskElement.innerHTML = `
      <div class="task-header">
        <span class="task-title">${taskObj.title}</span>
        <span class="priority-badge ${taskObj.priority}">${taskObj.priority}</span>
      </div>
      ${taskObj.description ? `<p class="task-desc">${taskObj.description}</p>` : ''}
      <span class="task-due">Due: ${taskObj.getFormattedDueDate()}</span>
      <div class="actions">
        <button class="complete">✔ Complete</button>
        <button class="edit">✏ Edit</button>
        <button class="delete">❌ Delete</button>
      </div>
    `;
    
    // Add drag event directly to the element
    taskElement.addEventListener('dragstart', handleDragStart);
    
    return taskElement;
  },

  // Render all tasks
  renderTasks: (tasks) => {
    DOM.clearTasks();
    
    // Group tasks by status using reduce (higher-order function)
    const tasksByStatus = tasks.reduce((acc, task) => {
      if (!acc[task.status]) acc[task.status] = [];
      acc[task.status].push(task);
      return acc;
    }, {});
    
    // Add tasks to their respective columns
    Object.entries(tasksByStatus).forEach(([status, tasks]) => {
      const column = document.getElementById(status);
      if (column) {
        tasks.forEach(task => {
          const taskElement = DOM.createTaskElement(task);
          column.appendChild(taskElement);
        });
      }
    });
  }
};

// Drag and drop handlers
function handleDragStart(e) {
  e.dataTransfer.setData('text/plain', e.target.dataset.id);
  e.dataTransfer.effectAllowed = 'move';
}

function setupDragAndDrop() {
  document.querySelectorAll('.column').forEach(column => {
    column.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      column.classList.add('drop-zone');
    });

    column.addEventListener('dragleave', () => {
      column.classList.remove('drop-zone');
    });

    column.addEventListener('drop', async (e) => {
      e.preventDefault();
      column.classList.remove('drop-zone');
      
      const taskId = parseInt(e.dataTransfer.getData('text/plain'));
      const newStatus = column.id;
      
      try {
        const task = taskStore.getTasks().find(t => t.id === taskId);
        if (task && task.status !== newStatus) {
          const updatedTask = { ...task, status: newStatus };
          await taskAPI.saveTasks(
            taskStore.getTasks().map(t => t.id === taskId ? updatedTask : t)
          );
          taskStore.updateTask(taskId, { status: newStatus });
        }
      } catch (error) {
        console.error('Failed to update task status:', error);
      }
    });
  });
}

// EVENT LISTENERS
openModalBtn.addEventListener('click', DOM.openModal);
closeModalBtn.addEventListener('click', DOM.closeModal);

// Form submission with destructuring and async/await
let isEditing = false;
let currentEditingId = null;

taskForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  try {
    if (isEditing && currentEditingId) {
      // Editing existing task - preserve status
      const originalTask = taskStore.getTasks().find(t => t.id === currentEditingId);
      const status = originalTask ? originalTask.status : 'todo';
      
      // Create updated task with original status
      const updatedTask = Task.createFromForm(this.elements, status);
      updatedTask.id = currentEditingId;
      
      await taskAPI.saveTasks(
        taskStore.getTasks().map(t => t.id === currentEditingId ? updatedTask : t)
      );
      taskStore.updateTask(currentEditingId, updatedTask);
    } else {
      // Creating new task
      const task = Task.createFromForm(this.elements);
      await taskAPI.saveTasks([...taskStore.getTasks(), task]);
      taskStore.addTask(task);
    }
    
    // Reset form and state
    this.reset();
    DOM.closeModal();
    isEditing = false;
    currentEditingId = null;
  } catch (error) {
    console.error('Failed to save task:', error);
    alert('Failed to save task. Please try again.');
  }
});

// Subscribe to task changes (reactive programming)
const unsubscribe = taskStore.subscribe(tasks => {
  DOM.renderTasks(tasks);
});

// Initialize with existing tasks and setup drag and drop
(async () => {
  try {
    const tasks = await taskAPI.fetchTasks();
    // Clear existing tasks before adding fetched ones to prevent duplication
    taskStore.tasks = [];
    tasks.forEach(task => taskStore.addTask(task));
    setupDragAndDrop();
  } catch (error) {
    console.error('Failed to load tasks:', error);
  }
})();

// Task actions with destructuring and higher-order functions
document.addEventListener('click', (e) => {
  const taskElement = e.target.closest('.task');
  if (!taskElement) return;
  
  const taskId = parseInt(taskElement.dataset.id);
  const task = taskStore.getTasks().find(t => t.id === taskId);
  if (!task) return;

  if (e.target.classList.contains('delete')) {
    taskStore.deleteTask(taskId);
  } else if (e.target.classList.contains('complete')) {
    const updatedTask = taskOperations.complete(task);
    taskStore.updateTask(taskId, updatedTask);
  } else if (e.target.classList.contains('edit')) {
    // Set editing state
    isEditing = true;
    currentEditingId = taskId;
    
    // Populate form with task data
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDesc').value = task.description;
    document.getElementById('taskDueDate').value = task.dueDate;
    document.getElementById('taskPriority').value = task.priority;
    
    // Open modal
    DOM.openModal();
  }
});