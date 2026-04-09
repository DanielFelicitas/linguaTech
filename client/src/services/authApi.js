import axios from 'axios'

const API_URL = 'http://localhost:5000/api/auth'

export const signupRequest = (payload) => axios.post(`${API_URL}/signup`, payload)
export const loginRequest = (payload) => axios.post(`${API_URL}/login`, payload)
