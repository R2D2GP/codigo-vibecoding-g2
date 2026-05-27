import axios from 'axios';

const API_URL = 'http://localhost:3000/api/tasks';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const taskApi = {
  getAll: () => axios.get(API_URL, { headers: getAuthHeader() }),

  getById: (id) => axios.get(`${API_URL}/${id}`, { headers: getAuthHeader() }),

  create: (task) => axios.post(API_URL, task, { headers: getAuthHeader() }),

  update: (id, task) => axios.put(`${API_URL}/${id}`, task, { headers: getAuthHeader() }),

  delete: (id) => axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() }),
};