// Initialize Task Manager
const taskManager = new TaskManager();

// DOM Elements
const taskForm = document.getElementById('task-form');
const taskTitleInput = document.getElementById('task-title');
const taskDescriptionInput = document.getElementById('task-description');
const taskPrioritySelect = document.getElementById('task-priority');
const taskCategorySelect = document.getElementById('task-category');
const tasksList = document.getElementById('tasks-list');
const formTitle = document.getElementById('form-title');
const saveBtn = document.getElementById('save-btn');
const cancelBtn = document.getElementById('cancel-btn');
const titleError = document.getElementById('title-error');
const descriptionError = document.getElementById('description-error');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const categoryFilter = document.getElementById('category-filter');
const priorityFilter = document.getElementById('priority-filter');
const sortBySelect = document.getElementById('sort-by');
const themeToggle = document.querySelector('.theme-toggle');
const notificationElement = document.getElementById('notification');

// Current editing task ID
let currentEditingTaskId = null;

// Initialize the app
function init() {
    renderTasks();
    setupEventListeners();
}

// Set up all event listeners
function setupEventListeners() {
    // Form submission
    taskForm.addEventListener('submit', handleFormSubmit);
    
    // Cancel button
    cancelBtn.addEventListener('click', cancelEdit);
    
    // Search functionality
    searchInput.addEventListener('input', renderTasks);
    searchBtn.addEventListener('click', renderTasks);
    
    // Filter changes
    categoryFilter.addEventListener('change', renderTasks);
    priorityFilter.addEventListener('change', renderTasks);
    
    // Sort changes
    sortBySelect.addEventListener('change', renderTasks);
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
}

// Handle form submission (add or update task)
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Validate inputs
    if (!validateForm()) {
        return;
    }
    
    const title = taskTitleInput.value.trim();
    const description = taskDescriptionInput.value.trim();
    const priority = taskPrioritySelect.value;
    const category = taskCategorySelect.value;
    
    if (currentEditingTaskId) {
        // Update existing task
        taskManager.updateTask(currentEditingTaskId, title, description, priority, category);
        showNotification('Task updated successfully', priority === 'high');
    } else {
        // Add new task
        taskManager.addTask(title, description, priority, category);
        showNotification('Task added successfully', priority === 'high');
    }
    
    // Reset form and render tasks
    resetForm();
    renderTasks();
}

// Validate form inputs
function validateForm() {
    let isValid = true;
    
    // Reset error messages
    titleError.textContent = '';
    descriptionError.textContent = '';
    
    // Validate title
    if (!taskTitleInput.value.trim()) {
        titleError.textContent = 'Title is required';
        isValid = false;
    }
    
    // Validate description (optional)
    if (taskDescriptionInput.value.trim().length > 500) {
        descriptionError.textContent = 'Description must be 500 characters or less';
        isValid = false;
    }
    
    return isValid;
}

// Reset form to default state
function resetForm() {
    taskForm.reset();
    formTitle.textContent = 'Add New Task';
    saveBtn.textContent = 'Save Task';
    cancelBtn.classList.add('hidden');
    currentEditingTaskId = null;
}

// Cancel editing and reset form
function cancelEdit() {
    resetForm();
}

// Edit an existing task
function editTask(taskId) {
    const task = taskManager.getTaskById(taskId);
    if (!task) return;
    
    // Populate form with task data
    taskTitleInput.value = task.title;
    taskDescriptionInput.value = task.description;
    taskPrioritySelect.value = task.priority;
    taskCategorySelect.value = task.category;
    
    // Update form UI for editing
    formTitle.textContent = 'Edit Task';
    saveBtn.textContent = 'Update Task';
    cancelBtn.classList.remove('hidden');
    
    currentEditingTaskId = taskId;
}

// Delete a task
function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        taskManager.deleteTask(taskId);
        showNotification('Task deleted successfully');
        renderTasks();
        
        // If editing the task that was just deleted, reset form
        if (currentEditingTaskId === taskId) {
            resetForm();
        }
    }
}

// Toggle task completion status
function toggleTaskCompletion(taskId) {
    const isCompleted = taskManager.toggleTaskCompletion(taskId);
    renderTasks();
    
    const task = taskManager.getTaskById(taskId);
    if (isCompleted && task.priority === 'high') {
        showNotification('High-priority task completed!', true);
    }
}

// Render all tasks based on current filters and search
function renderTasks() {
    const searchQuery = searchInput.value.trim();
    const category = categoryFilter.value;
    const priority = priorityFilter.value;
    const sortBy = sortBySelect.value;
    
    // Filter and sort tasks
    let filteredTasks = taskManager.getAllTasks();
    
    if (searchQuery) {
        filteredTasks = taskManager.searchTasks(searchQuery);
    }
    
    filteredTasks = filteredTasks.filter(task => 
        task.matchesFilters(category, priority)
    );
    
    filteredTasks = taskManager.sortTasks(sortBy);
    
    // Clear the tasks list
    tasksList.innerHTML = '';
    
    // Render each task
    if (filteredTasks.length === 0) {
        tasksList.innerHTML = '<p class="no-tasks">No tasks found.</p>';
        return;
    }
    
    filteredTasks.forEach(task => {
        const taskElement = createTaskElement(task);
        tasksList.appendChild(taskElement);
    });
}

// Create a DOM element for a task
function createTaskElement(task) {
    const taskElement = document.createElement('div');
    taskElement.classList.add('task-item');
    if (task.completed) {
        taskElement.classList.add('task-completed');
    }
    
    // Format the date
    const formattedDate = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(task.createdAt);
    
    taskElement.innerHTML = `
        <div class="task-header">
            <h3 class="task-title">${task.title}</h3>
            <div class="task-meta">
                <span class="task-category category-${task.category}">${task.category}</span>
                <span class="task-priority priority-${task.priority}">${task.priority}</span>
                <span class="task-date">${formattedDate}</span>
            </div>
        </div>
        <p class="task-description">${task.description}</p>
        <div class="task-actions">
            <button class="complete-btn" data-id="${task.id}">
                <i class="fas ${task.completed ? 'fa-undo' : 'fa-check'}"></i>
            </button>
            <button class="edit-btn" data-id="${task.id}">
                <i class="fas fa-edit"></i>
            </button>
            <button class="delete-btn" data-id="${task.id}">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // Add event listeners to task actions
    const completeBtn = taskElement.querySelector('.complete-btn');
    const editBtn = taskElement.querySelector('.edit-btn');
    const deleteBtn = taskElement.querySelector('.delete-btn');
    
    completeBtn.addEventListener('click', () => toggleTaskCompletion(task.id));
    editBtn.addEventListener('click', () => editTask(task.id));
    deleteBtn.addEventListener('click', () => deleteTask(task.id));
    
    return taskElement;
}

// Show notification
function showNotification(message, isHighPriority = false) {
    notificationElement.textContent = message;
    notificationElement.className = 'notification';
    if (isHighPriority) {
        notificationElement.classList.add('notification-high');
    } else {
        notificationElement.classList.add('notification-info');
    }
    
    // Show notification
    notificationElement.classList.remove('notification-hidden');
    
    // Hide after 3 seconds
    setTimeout(() => {
        notificationElement.classList.add('notification-hidden');
        setTimeout(() => {
            notificationElement.textContent = '';
            notificationElement.classList.remove('notification-high', 'notification-info');
        }, 300);
    }, 3000);
}

// Toggle dark/light theme
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    
    if (document.body.classList.contains('dark-theme')) {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('theme', 'dark');
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', 'light');
    }
}

// Apply saved theme on page load
function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

// Initialize the application
applySavedTheme();
init();