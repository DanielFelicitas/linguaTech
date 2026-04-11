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

async function readJsonBody(response) {
  const text = await response.text()
  if (!text.trim()) return {}
  try {
    return JSON.parse(text)
  } catch {
    return { _nonJson: true, _bodyPreview: text.slice(0, 240) }
  }
}

function upstreamProviderMessage(data, fallbackLabel) {
  if (!data || typeof data !== 'object') return `${fallbackLabel} request failed.`
  if (data._nonJson) {
    return `Unexpected response from AI provider (not JSON). ${data._bodyPreview || ''}`.trim()
  }
  const e = data.error
  if (typeof e === 'string') return e
  if (e && typeof e.message === 'string') return e.message
  try {
    return JSON.stringify(data)
  } catch {
    return `${fallbackLabel} request failed.`
  }
}

function shouldRetryHfError(status, message) {
  if (status === 429) return false
  if (status === 503) return true
  if (status >= 500) return true
  const m = (message || '').toLowerCase()
  return (
    m.includes('initialization failed') ||
    m.includes('initialisation failed') ||
    m.includes('model is loading') ||
    m.includes('temporarily unavailable')
  )
}

async function chatHuggingFaceRouter(req, res) {
  const token = getHfToken()
  const { messages } = req.body

  const url = (process.env.HF_ROUTER_URL || DEFAULT_HF_ROUTER_URL).replace(/\/$/, '')
  const model = process.env.HF_CHAT_MODEL || DEFAULT_HF_CHAT_MODEL

  const body = JSON.stringify({
    model,
    messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
    temperature: 0.7,
    max_tokens: 1024,
  })

  let maxAttempts = parseInt(process.env.HF_CHAT_RETRIES || '2', 10)
  if (!Number.isFinite(maxAttempts) || maxAttempts < 1) maxAttempts = 2
  if (maxAttempts > 5) maxAttempts = 5

  let response
  let data = {}

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body,
    })
    data = await readJsonBody(response)
    if (response.ok) break

    const errMsg = upstreamProviderMessage(data, 'Hugging Face router')
    const retry = attempt < maxAttempts - 1 && shouldRetryHfError(response.status, errMsg)
    if (retry) {
      const delayMs = 2000 * (attempt + 1)
      console.warn(`HF router error (attempt ${attempt + 1}/${maxAttempts}), retrying in ${delayMs}ms:`, errMsg)
      await new Promise((r) => setTimeout(r, delayMs))
      continue
    }
    break
  }

  if (!response.ok) {
    let errMsg = upstreamProviderMessage(data, 'Hugging Face router')
    const lower = errMsg.toLowerCase()
    if (lower.includes('initialization failed') || lower.includes('initialisation failed')) {
      errMsg =
        'The Hugging Face model host failed to start (transient). Wait a few seconds and try again. If it keeps failing, try HF_CHAT_MODEL with another model from huggingface.co or set OPENAI_API_KEY on the server as a fallback.'
    }
    const clientStatus = response.status >= 500 ? 502 : response.status
    return res.status(clientStatus).json({ message: errMsg })
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

  const data = await readJsonBody(response)

  if (!response.ok) {
    const errMsg =
      data?.error?.message || upstreamProviderMessage(data, 'OpenAI') || 'OpenAI request failed.'
    const clientStatus = response.status >= 500 ? 502 : response.status
    return res.status(clientStatus).json({ message: errMsg })
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
