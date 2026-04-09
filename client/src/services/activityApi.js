import axios from 'axios'

const API_URL = 'http://localhost:5000/api/activities'

export const checkGrammarRequest = (payload) =>
  axios.post(`${API_URL}/grammar-check`, payload)

export const getReadingQuizzesRequest = () => axios.get(`${API_URL}/reading-quizzes`)

export const createReadingQuizRequest = (payload) => {
  const token = localStorage.getItem('linguatech_token')
  return axios.post(`${API_URL}/reading-quizzes`, payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}

export const updateReadingQuizRequest = (quizId, payload) => {
  const token = localStorage.getItem('linguatech_token')
  return axios.put(`${API_URL}/reading-quizzes/${quizId}`, payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}

export const deleteReadingQuizRequest = (quizId) => {
  const token = localStorage.getItem('linguatech_token')
  return axios.delete(`${API_URL}/reading-quizzes/${quizId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}

export const submitReadingQuizRequest = (quizId, payload) => {
  const token = localStorage.getItem('linguatech_token')
  return axios.post(`${API_URL}/reading-quizzes/${quizId}/submit`, payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}

export const getMyReadingAttemptsRequest = () => {
  const token = localStorage.getItem('linguatech_token')
  return axios.get(`${API_URL}/reading-attempts/me`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}

export const getAdminReadingAttemptsRequest = () => {
  const token = localStorage.getItem('linguatech_token')
  return axios.get(`${API_URL}/reading-attempts/admin`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}
