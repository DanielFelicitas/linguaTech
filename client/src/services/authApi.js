import axios from 'axios'
import { API_ORIGIN } from '../lib/apiBase.js'

const API_URL = `${API_ORIGIN}/api/auth`

export const signupRequest = (payload) => axios.post(`${API_URL}/signup`, payload)
export const loginRequest = (payload) => axios.post(`${API_URL}/login`, payload)
