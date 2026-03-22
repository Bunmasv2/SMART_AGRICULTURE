import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

export const authService = {
    register: async (data: any) => {
        const response = await axios.post(`${API_URL}/register`, data);
        return response.data;
    },
    verify: async (data: { email: string; code: string }) => {
        const response = await axios.post(`${API_URL}/verify`, data);
        return response.data;
    },
    login: async (data: any) => {
        const response = await axios.post(`${API_URL}/login`, data);
        return response.data;
    }
};
