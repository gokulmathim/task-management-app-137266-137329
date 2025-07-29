const Task = require("../models/Task");

// PUBLIC_INTERFACE
// List all tasks, with sorting/filtering via query
async function getAllTasks(req, res, next) {
  try {
    const { completed, sort, priority, search } = req.query;
    const filter = {};
    if (completed !== undefined) filter.completed = completed === "true";
    if (priority) filter.priority = priority;
    if (search) filter.title = { $regex: search, $options: "i" };
    let query = Task.find(filter);

    // Sorting logic
    if (sort === "dueDate") query = query.sort({ dueDate: 1 });
    if (sort === "createdAt") query = query.sort({ createdAt: -1 });
    if (sort === "priority") query = query.sort({ priority: 1 });

    const tasks = await query.exec();
    res.json(tasks);
  } catch (e) {
    next(e);
  }
}

// PUBLIC_INTERFACE
// Get a single task by ID
async function getTask(req, res, next) {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (e) {
    next(e);
  }
}

// PUBLIC_INTERFACE
// Create a new task
async function createTask(req, res, next) {
  try {
    const { title, description, dueDate, priority } = req.body;
    if (!title || title.length > 100) {
      return res.status(400).json({ error: "Title is required and must be <= 100 chars" });
    }
    const task = new Task({
      title: title.trim(),
      description: description ? description.trim() : "",
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority,
    });
    await task.save();
    res.status(201).json(task);
  } catch (e) {
    next(e);
  }
}

// PUBLIC_INTERFACE
// Update a task
async function updateTask(req, res, next) {
  try {
    const updates = req.body;
    if (updates.title && updates.title.length > 100) {
      return res.status(400).json({ error: "Title must be <= 100 chars" });
    }
    if (updates.description && updates.description.length > 500) {
      return res.status(400).json({ error: "Description must be <= 500 chars" });
    }
    if (updates.dueDate) updates.dueDate = new Date(updates.dueDate);

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (e) {
    next(e);
  }
}

// PUBLIC_INTERFACE
// Delete a task
async function deleteTask(req, res, next) {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
}

// PUBLIC_INTERFACE
// Toggle task completed status
async function toggleTaskCompleted(req, res, next) {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    task.completed = !task.completed;
    await task.save();
    res.json(task);
  } catch (e) {
    next(e);
  }
}

module.exports = {
  getAllTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskCompleted,
};
