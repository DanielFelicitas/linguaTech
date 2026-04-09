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

export const deleteReadingAttemptRequest = (attemptId) => {
  const token = localStorage.getItem('linguatech_token')
  return axios.delete(`${API_URL}/reading-attempts/${attemptId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}

export const getOpinionPromptsRequest = () => axios.get(`${API_URL}/opinion-prompts`)

export const createOpinionPromptRequest = (payload) => {
  const token = localStorage.getItem('linguatech_token')
  return axios.post(`${API_URL}/opinion-prompts`, payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}

export const updateOpinionPromptRequest = (promptId, payload) => {
  const token = localStorage.getItem('linguatech_token')
  return axios.put(`${API_URL}/opinion-prompts/${promptId}`, payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}

export const deleteOpinionPromptRequest = (promptId) => {
  const token = localStorage.getItem('linguatech_token')
  return axios.delete(`${API_URL}/opinion-prompts/${promptId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}

export const submitOpinionAnswerRequest = (promptId, payload) => {
  const token = localStorage.getItem('linguatech_token')
  return axios.post(`${API_URL}/opinion-prompts/${promptId}/submit`, payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}

export const getMyOpinionSubmissionRequest = (promptId) => {
  const token = localStorage.getItem('linguatech_token')
  return axios.get(`${API_URL}/opinion-prompts/${promptId}/submission/me`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}

export const getAdminOpinionSubmissionsRequest = () => {
  const token = localStorage.getItem('linguatech_token')
  return axios.get(`${API_URL}/opinion-submissions/admin`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}

export const deleteOpinionSubmissionRequest = (submissionId) => {
  const token = localStorage.getItem('linguatech_token')
  return axios.delete(`${API_URL}/opinion-submissions/${submissionId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}

export const updateOpinionSubmissionFeedbackRequest = (submissionId, payload) => {
  const token = localStorage.getItem('linguatech_token')
  return axios.patch(`${API_URL}/opinion-submissions/${submissionId}/feedback`, payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}
