class Task {
    constructor(id, title, description, priority, category, completed = false, createdAt = new Date()) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.category = category;
        this.completed = completed;
        this.createdAt = createdAt;
    }

    // Update task properties
    update(title, description, priority, category) {
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.category = category;
    }

    // Toggle completion status
    toggleCompletion() {
        this.completed = !this.completed;
        return this.completed;
    }

    // Method to check if task matches search query
    matchesSearch(query) {
        const lowerCaseQuery = query.toLowerCase();
        return (
            this.title.toLowerCase().includes(lowerCaseQuery) ||
            this.description.toLowerCase().includes(lowerCaseQuery)
        );
    }

    // Method to check if task matches filter criteria
    matchesFilters(categoryFilter, priorityFilter) {
        const categoryMatch = categoryFilter === 'all' || this.category === categoryFilter;
        const priorityMatch = priorityFilter === 'all' || this.priority === priorityFilter;
        
        return categoryMatch && priorityMatch;
    }
}