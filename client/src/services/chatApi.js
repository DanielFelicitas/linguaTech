import axios from 'axios'
import { API_ORIGIN } from '../lib/apiBase.js'

const API_URL = `${API_ORIGIN}/api/chat`

export const sendChatMessage = (messages) => axios.post(API_URL, { messages })
