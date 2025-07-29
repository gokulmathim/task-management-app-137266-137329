const express = require("express");
const {
  getAllTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskCompleted,
} = require("../controllers/taskController");

const router = express.Router();

/**
 * GET /api/tasks
 * List all tasks (optionally with query)
 */
router.get("/", getAllTasks);

/**
 * GET /api/tasks/:id
 * Get a single task
 */
router.get("/:id", getTask);

/**
 * POST /api/tasks
 * Create a new task
 */
router.post("/", createTask);

/**
 * PATCH /api/tasks/:id
 * Update a task
 */
router.patch("/:id", updateTask);

/**
 * PATCH /api/tasks/:id/toggle
 * Toggle task completed status
 */
router.patch("/:id/toggle", toggleTaskCompleted);

/**
 * DELETE /api/tasks/:id
 * Delete a task
 */
router.delete("/:id", deleteTask);

module.exports = router;
