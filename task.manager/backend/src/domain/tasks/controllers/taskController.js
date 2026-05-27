import * as taskService from '../services/taskService.js';

export const getAllTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await taskService.getTasksByUserId(userId);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks' });
  }
};

export const getTaskById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const task = await taskService.getTaskById(id, userId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task' });
  }
};

export const createTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const task = await taskService.createTask({ ...req.body, userId });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task' });
  }
};

export const updateTask = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const updated = await taskService.updateTask(id, userId, req.body);

    if (!updated) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task' });
  }
};

export const deleteTask = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const deleted = await taskService.deleteTask(id, userId);

    if (!deleted) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task' });
  }
};