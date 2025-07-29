import React, { useState, useEffect } from "react";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskCompleted,
} from "./api";
import "./App.css";

/**
 * Task form for creating/editing tasks (accessibility included)
 */
function TaskForm({ onSave, onCancel, initial, submitting }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [priority, setPriority] = useState(initial?.priority || "Medium");
  const [dueDate, setDueDate] = useState(
    initial?.dueDate ? initial.dueDate.slice(0, 10) : ""
  );
  const [error, setError] = useState(null);
  useEffect(() => {
    setTitle(initial?.title || "");
    setDescription(initial?.description || "");
    setPriority(initial?.priority || "Medium");
    setDueDate(initial?.dueDate ? initial.dueDate.slice(0, 10) : "");
  }, [initial]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (title.length > 100) {
      setError("Title must be less than 100 characters.");
      return;
    }
    if (description && description.length > 500) {
      setError("Description must be less than 500 characters.");
      return;
    }
    setError(null);
    onSave({
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate || null,
      priority,
    });
  }
  return (
    <form className="task-form" onSubmit={handleSubmit} aria-label="Task form">
      <label>
        Title <span aria-hidden="true">*</span>
        <input
          aria-required="true"
          maxLength={100}
          disabled={submitting}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          required
        />
      </label>
      <label>
        Description
        <textarea
          maxLength={500}
          disabled={submitting}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
        />
      </label>
      <label>
        Priority
        <select
          value={priority}
          disabled={submitting}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
      </label>
      <label>
        Due Date
        <input
          type="date"
          disabled={submitting}
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          min={new Date().toISOString().slice(0, 10)}
        />
      </label>
      {error && (
        <div className="form-error" role="alert" aria-live="assertive">
          {error}
        </div>
      )}
      <div className="form-actions">
        <button
          type="submit"
          className="btn"
          disabled={submitting}
          aria-disabled={submitting}
        >
          {submitting ? "Saving..." : initial ? "Update" : "Add Task"}
        </button>
        {onCancel && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={submitting}
            aria-disabled={submitting}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

/**
 * Accessible filtering and sorting bar (mobile friendly)
 */
function TaskFilterSort({ onChange, values }) {
  return (
    <section className="task-filters" role="region" aria-label="Task Filters">
      <label>
        Show
        <select
          value={values.completed}
          onChange={(e) => onChange({ completed: e.target.value })}
        >
          <option value="">All</option>
          <option value="false">Active</option>
          <option value="true">Completed</option>
        </select>
      </label>
      <label>
        Priority
        <select
          value={values.priority}
          onChange={(e) => onChange({ priority: e.target.value })}
        >
          <option value="">All</option>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
      </label>
      <label>
        Sort by
        <select
          value={values.sort}
          onChange={(e) => onChange({ sort: e.target.value })}
        >
          <option value="">Newest</option>
          <option value="dueDate">Due Date</option>
          <option value="priority">Priority</option>
        </select>
      </label>
      <label>
        Search
        <input
          type="search"
          value={values.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Search titles"
        />
      </label>
    </section>
  );
}

/**
 * Single Task Item component, accessible
 */
function TaskItem({ task, onEdit, onDelete, onToggle }) {
  return (
    <li className={`task-item${task.completed ? " completed" : ""}`}>
      <span className="sr-only">
        {task.completed ? "Completed task:" : "Active task:"}
      </span>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task)}
        aria-label={`Mark "${task.title}" as ${task.completed ? "active" : "completed"}`}
      />
      <span className="task-title">{task.title}</span>
      <span className="task-priority priority" aria-label={"Priority: " + task.priority}>
        {task.priority}
      </span>
      {task.dueDate && (
        <span className="task-due" aria-label="Due date">
          🗓 {new Date(task.dueDate).toLocaleDateString()}
        </span>
      )}
      <button onClick={() => onEdit(task)} className="btn btn-icon" title="Edit task" aria-label="Edit task">
        ✏️
      </button>
      <button onClick={() => onDelete(task)} className="btn btn-icon" title="Delete task" aria-label="Delete task">
        🗑
      </button>
      {task.description && <div className="task-desc">{task.description}</div>}
    </li>
  );
}

/**
 * Main App
 */
// PUBLIC_INTERFACE
function App() {
  // THEME
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  // TASKS STATE
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Filter/sort state
  const [filters, setFilters] = useState({
    completed: "",
    priority: "",
    sort: "",
    search: "",
  });

  // Form (create/edit) state
  const [editingTask, setEditingTask] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch tasks
  async function loadTasks() {
    setLoading(true);
    setApiError(null);
    try {
      const result = await getTasks(filters);
      setTasks(result);
    } catch (e) {
      setApiError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line
  }, [JSON.stringify(filters)]);

  // Handlers
  function handleFilterChange(delta) {
    setFilters((f) => ({ ...f, ...delta }));
  }

  async function handleAddTask(task) {
    setSubmitting(true);
    setApiError(null);
    try {
      await createTask(task);
      setShowForm(false);
      loadTasks();
    } catch (e) {
      setApiError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleEditTask(task) {
    setEditingTask(task);
    setShowForm(true);
  }

  async function handleUpdateTask(data) {
    setSubmitting(true);
    setApiError(null);
    try {
      await updateTask(editingTask._id, data);
      setEditingTask(null);
      setShowForm(false);
      loadTasks();
    } catch (e) {
      setApiError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteTask(task) {
    if (!window.confirm(`Delete task "${task.title}"?`)) return;
    setApiError(null);
    try {
      await deleteTask(task._id);
      loadTasks();
    } catch (e) {
      setApiError(e.message);
    }
  }

  async function handleToggleCompleted(task) {
    setApiError(null);
    try {
      await toggleTaskCompleted(task._id);
      loadTasks();
    } catch (e) {
      setApiError(e.message);
    }
  }

  function handleDismissForm() {
    setShowForm(false);
    setEditingTask(null);
  }

  // Sort incomplete tasks before completed
  const displayTasks = [...tasks].sort((a, b) => {
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    // Secondary sort: dueDate if available
    if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
    return 0;
  });

  return (
    <div className="App" role="application">
      <header className="App-header">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
        <h1 style={{ marginBottom: 0 }}>Task Management</h1>
        <p className="subtitle">Boost your productivity with a clean, responsive, accessible task manager.</p>
      </header>
      <main className="container">
        <TaskFilterSort onChange={handleFilterChange} values={filters} />
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingTask(null);
            setShowForm(true);
          }}
          style={{ margin: "20px 0" }}
        >
          + Add Task
        </button>
        {(showForm || editingTask) && (
          <TaskForm
            onSave={editingTask ? handleUpdateTask : handleAddTask}
            onCancel={handleDismissForm}
            initial={editingTask}
            submitting={submitting}
          />
        )}
        {apiError && (
          <div className="form-error" role="alert" style={{ marginBottom: "1em" }}>
            {apiError}
          </div>
        )}
        {loading ? (
          <div role="status" aria-live="polite">
            Loading tasks...
          </div>
        ) : (
          <ul className="task-list" aria-label="Task list">
            {displayTasks.length === 0 ? (
              <li>No tasks found.</li>
            ) : (
              displayTasks.map((task) => (
                <TaskItem
                  key={task._id}
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onToggle={handleToggleCompleted}
                />
              ))
            )}
          </ul>
        )}
      </main>
      <footer style={{ fontSize: "0.9em", color: "var(--text-secondary)", margin: "2em 0" }}>
        TaskManagementAppMonolith &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}

export default App;
