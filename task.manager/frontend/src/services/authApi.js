import axios from 'axios';

const API_URL = 'http://localhost:3000/api/users';

export const authApi = {
  register: (userData) => axios.post(`${API_URL}/register`, userData),
  
  login: (credentials) => axios.post(`${API_URL}/login`, credentials),
};