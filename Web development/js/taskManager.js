class TaskManager {
    constructor() {
        this.tasks = [];
        this.nextId = 1;
        this.loadTasksFromStorage();
    }

    // Add a new task
    addTask(title, description, priority, category) {
        const newTask = new Task(
            this.nextId++,
            title,
            description,
            priority,
            category
        );
        this.tasks.push(newTask);
        this.saveTasksToStorage();
        return newTask;
    }

    // Get all tasks
    getAllTasks() {
        return this.tasks;
    }

    // Get task by ID
    getTaskById(id) {
        return this.tasks.find(task => task.id === id);
    }

    // Update task
    updateTask(id, title, description, priority, category) {
        const task = this.getTaskById(id);
        if (task) {
            task.update(title, description, priority, category);
            this.saveTasksToStorage();
            return true;
        }
        return false;
    }

    // Delete task
    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasksToStorage();
    }

    // Toggle task completion status
    toggleTaskCompletion(id) {
        const task = this.getTaskById(id);
        if (task) {
            task.toggleCompletion();
            this.saveTasksToStorage();
            return task.completed;
        }
        return false;
    }

    // Filter tasks by category and priority
    filterTasks(categoryFilter = 'all', priorityFilter = 'all') {
        return this.tasks.filter(task => 
            task.matchesFilters(categoryFilter, priorityFilter)
        );
    }

    // Search tasks by title or description
    searchTasks(query) {
        if (!query) return this.tasks;
        return this.tasks.filter(task => task.matchesSearch(query));
    }

    // Sort tasks by date (newest first) or priority (high to low)
    sortTasks(sortBy = 'date') {
        const sortedTasks = [...this.tasks];
        
        if (sortBy === 'date') {
            sortedTasks.sort((a, b) => b.createdAt - a.createdAt);
        } else if (sortBy === 'priority') {
            const priorityOrder = { high: 1, medium: 2, low: 3 };
            sortedTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        }
        
        return sortedTasks;
    }

    // Local Storage Methods
    saveTasksToStorage() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    loadTasksFromStorage() {
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            this.tasks = JSON.parse(storedTasks).map(taskData => {
                return new Task(
                    taskData.id,
                    taskData.title,
                    taskData.description,
                    taskData.priority,
                    taskData.category,
                    taskData.completed,
                    new Date(taskData.createdAt)
                );
            });
            
            // Find the next available ID
            if (this.tasks.length > 0) {
                this.nextId = Math.max(...this.tasks.map(task => task.id)) + 1;
            }
        }
    }
}