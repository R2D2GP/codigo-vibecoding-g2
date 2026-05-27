import { v4 as uuidv4 } from 'uuid';

let tasks = [];

export const getTasks = () => tasks;

export const getTaskById = (id) => tasks.find(task => task.id === id);

export const addTask = (task) => {
  const now = new Date().toISOString();
  const newTask = {
    id: uuidv4(),
    title: task.title,
    description: task.description || '',
    completed: false,
    created_at: now,
    updated_at: now
  };
  tasks.push(newTask);
  return newTask;
};

export const updateTask = (id, updates) => {
  const index = tasks.findIndex(task => task.id === id);
  if (index === -1) return null;

  tasks[index] = {
    ...tasks[index],
    ...updates,
    updated_at: new Date().toISOString()
  };
  return tasks[index];
};

export const deleteTask = (id) => {
  const index = tasks.findIndex(task => task.id === id);
  if (index === -1) return false;
  tasks.splice(index, 1);
  return true;
};