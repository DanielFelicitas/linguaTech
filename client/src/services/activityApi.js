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
