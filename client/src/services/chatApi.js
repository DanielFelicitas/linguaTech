import axios from 'axios'

const API_URL = 'http://localhost:5000/api/chat'

export const sendChatMessage = (messages) => axios.post(API_URL, { messages })
