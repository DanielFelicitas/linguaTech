import { useRef, useState } from 'react'
import { sendChatMessage } from '../services/chatApi'

function ChatBot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hi! Paste a sentence or ask how to say something in English. I will help with grammar and natural phrasing.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async (event) => {
    event.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    const userMsg = { role: 'user', content: text }
    const historyForApi = [...messages, userMsg].filter((m) => m.role !== 'system')

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setError('')
    setLoading(true)

    try {
      const { data } = await sendChatMessage(historyForApi)
      setMessages((prev) => [...prev, { role: 'assistant', content: data.content }])
      setTimeout(scrollToBottom, 100)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reach the chat service. Check server and API keys.')
    } finally {
      setLoading(false)
      setTimeout(scrollToBottom, 100)
    }
  }

  return (
    <section className="flex min-h-[70vh] flex-col rounded-3xl border border-[#e7e7ee] bg-[#F5F5F7] p-6 shadow-sm">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-[#5A4DD5]">Chat tutor</h1>
        <p className="text-[#6E7382]">
          Practice writing. Get grammar fixes and natural ways to say things (Hugging Face Inference Router).
        </p>
      </div>

      <div className="mb-4 flex flex-1 flex-col overflow-hidden rounded-2xl border border-[#dcefff] bg-white">
        <div className="max-h-[min(420px,50vh)] flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((msg, index) => (
            <div
              key={`${index}-${msg.content.slice(0, 20)}`}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-[#5A4DD5] text-white'
                    : 'bg-[#F5F5F7] text-[#1F2430]'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-[#F5F5F7] px-4 py-2 text-sm text-[#6E7382]">Thinking…</div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="border-t border-[#e7e7ee] p-3">
          {error && <p className="mb-2 text-sm text-[#FF3D00]">{error}</p>}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your sentence or question…"
              className="flex-1 rounded-xl border border-[#d8dbe7] bg-white px-3 py-2 text-[#1F2430] outline-none focus:border-[#4ED0FF]"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-xl bg-[#4ED0FF] px-4 py-2 text-sm font-semibold text-[#0a2f40] disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

export default ChatBot
