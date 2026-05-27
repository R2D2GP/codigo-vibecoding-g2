import prisma from '../../../config/prisma.js';

export const getTasksByUserId = (userId) => {
  return prisma.task.findMany({ where: { userId } });
};

export const getTaskById = async (id, userId) => {
  try {
    return await prisma.task.findFirst({ where: { id, userId } });
  } catch (error) {
    return null;
  }
};

export const createTask = async (taskData) => {
  return await prisma.task.create({ data: taskData });
};

export const updateTask = async (id, userId, taskData) => {
  try {
    return await prisma.task.update({ where: { id, userId }, data: taskData });
  } catch (error) {
    return null;
  }
};

export const deleteTask = async (id, userId) => {
  try {
    await prisma.task.delete({ where: { id, userId } });
    return true;
  } catch (error) {
    return false;
  }
};