const SYSTEM_PROMPT = `You are LinguaTech, a professional English communication coach.
Focus on improving idea clarity, sentence structure, and professional tone.
Important rules:
- Ignore uppercase/lowercase mistakes and minor spelling issues unless they block understanding.
- Prioritize stronger wording, clearer thought flow, and concise professional phrasing.
- Give actionable feedback that helps students express ideas better.
Keep responses supportive and practical.`

/** Hugging Face Inference Router (OpenAI-compatible). Replaces deprecated api-inference.huggingface.co */
const DEFAULT_HF_ROUTER_URL = 'https://router.huggingface.co/v1/chat/completions'
/** Hub model id; add :fastest / :cheapest / :groq etc. per HF Inference Providers docs */
const DEFAULT_HF_CHAT_MODEL = 'meta-llama/Llama-3.1-8B-Instruct:fastest'

function getHfToken() {
  return process.env.HUGGINGFACE_API_TOKEN || process.env.HF_TOKEN
}

async function chatHuggingFaceRouter(req, res) {
  const token = getHfToken()
  const { messages } = req.body

  const url = (process.env.HF_ROUTER_URL || DEFAULT_HF_ROUTER_URL).replace(/\/$/, '')
  const model = process.env.HF_CHAT_MODEL || DEFAULT_HF_CHAT_MODEL

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    const errMsg =
      data?.error?.message ||
      (typeof data?.error === 'string' ? data.error : null) ||
      JSON.stringify(data) ||
      'Hugging Face router request failed.'
    return res.status(response.status).json({ message: errMsg })
  }

  const content = data?.choices?.[0]?.message?.content?.trim()
  if (!content) {
    return res.status(502).json({ message: 'Empty response from Hugging Face router.' })
  }

  return res.json({
    role: 'assistant',
    content,
    model,
  })
}

async function chatOpenAI(req, res) {
  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
  const { messages } = req.body

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    const errMsg = data?.error?.message || 'OpenAI request failed.'
    return res.status(response.status).json({ message: errMsg })
  }

  const content = data?.choices?.[0]?.message?.content?.trim()
  if (!content) {
    return res.status(502).json({ message: 'Empty response from model.' })
  }

  return res.json({
    role: 'assistant',
    content,
    model,
  })
}

export const chat = async (req, res) => {
  try {
    const { messages } = req.body

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: 'messages array is required.' })
    }

    const hfToken = getHfToken()
    const openaiKey = process.env.OPENAI_API_KEY

    if (hfToken) {
      return await chatHuggingFaceRouter(req, res)
    }
    if (openaiKey) {
      return await chatOpenAI(req, res)
    }

    return res.status(503).json({
      message:
        'Chat is not configured. Add HUGGINGFACE_API_TOKEN or HF_TOKEN (Hugging Face router) or OPENAI_API_KEY to server/.env and restart the server.',
    })
  } catch (error) {
    console.error('Chat error:', error.message)
    return res.status(500).json({ message: 'Chat request failed.' })
  }
}
