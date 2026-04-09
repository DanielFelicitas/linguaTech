import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { sendChatMessage } from '../services/chatApi'

function SpeakingActivity() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [message, setMessage] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [aiFeedback, setAiFeedback] = useState({
    professionalRewrite: '',
    whyBetter: [],
    alternatives: [],
  })

  const recognitionRef = useRef(null)
  const finalTranscriptRef = useRef('')
  const keepListeningRef = useRef(false)
  const manuallyStoppedRef = useRef(false)

  const speechSupported = useMemo(
    () => typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition),
    [],
  )

  const startSpeaking = async () => {
    if (!speechSupported) {
      setMessage('Speech-to-text is not supported in this browser. Please use Chrome or Edge.')
      return
    }

    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach((track) => track.stop())
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognitionRef.current = recognition
      keepListeningRef.current = true
      manuallyStoppedRef.current = false

      recognition.lang = 'en-US'
      recognition.interimResults = true
      recognition.continuous = true

      recognition.onstart = () => {
        setIsListening(true)
        finalTranscriptRef.current = ''
        setTranscript('')
        setAiFeedback({ professionalRewrite: '', whyBetter: [], alternatives: [] })
        setMessage('Listening... start talking now.')
      }

      recognition.onresult = (event) => {
        let interimText = ''
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i]
          const chunk = result[0].transcript || ''
          if (result.isFinal) {
            finalTranscriptRef.current = `${finalTranscriptRef.current} ${chunk}`.trim()
          } else {
            interimText = `${interimText} ${chunk}`.trim()
          }
        }
        setTranscript(`${finalTranscriptRef.current} ${interimText}`.trim())
      }

      recognition.onerror = (event) => {
        setIsListening(false)
        keepListeningRef.current = false
        if (event.error === 'network') {
          setMessage('Speech service network issue. Please check internet or try Chrome.')
        } else if (event.error === 'not-allowed') {
          setMessage('Microphone permission blocked. Please allow microphone access.')
        } else {
          setMessage(`Speech error: ${event.error}`)
        }
      }

      recognition.onend = () => {
        setIsListening(false)
        setTranscript(finalTranscriptRef.current.trim())
        if (manuallyStoppedRef.current) {
          setMessage('Stopped. Your speech has been converted to text.')
          return
        }
        if (keepListeningRef.current) {
          try {
            recognition.start()
            setMessage('Listening... start talking now.')
          } catch {
            setMessage('Speech recognition ended unexpectedly. Please click Start Speaking again.')
          }
        }
      }

      recognition.start()
    } catch {
      setMessage('Microphone permission denied or unavailable.')
    }
  }

  const stopSpeaking = () => {
    if (recognitionRef.current) {
      keepListeningRef.current = false
      manuallyStoppedRef.current = true
      recognitionRef.current.stop()
    }
  }

  const generateFeedback = async () => {
    if (!transcript.trim()) {
      setMessage('Please speak first so we can generate feedback.')
      return
    }

    try {
      setIsChecking(true)
      const feedback = await requestProfessionalFeedback(transcript)
      setAiFeedback(feedback)
      setMessage('Professional feedback is ready.')
    } catch (error) {
      setAiFeedback({ professionalRewrite: '', whyBetter: [], alternatives: [] })
      setMessage(error.response?.data?.message || 'Feedback generation failed.')
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <section className="space-y-6 rounded-3xl border border-[#e7e7ee] bg-[#F5F5F7] p-8 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="mb-1 text-3xl font-bold text-[#5A4DD5]">Speaking Practice</h1>
          <p className="text-[#6E7382]">Speech-to-text with professional sentence feedback.</p>
        </div>
        <Link to="/activities" className="rounded-xl border border-[#d8dbe7] bg-white px-4 py-2 text-sm font-semibold text-[#1F2430]">
          ← Back to Activities
        </Link>
      </div>

      <article className="rounded-2xl border border-[#dcefff] bg-white p-5">
        <h2 className="mb-3 text-lg font-semibold text-[#2979FF]">🎤 Speech to Text</h2>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={startSpeaking} disabled={isListening} className="rounded-xl bg-[#4ED0FF] px-4 py-2 text-sm font-semibold text-[#0a2f40] disabled:opacity-60">
            {isListening ? 'Listening...' : 'Start Speaking'}
          </button>
          <button type="button" onClick={stopSpeaking} disabled={!isListening} className="rounded-xl border border-[#FF3D00] px-4 py-2 text-sm font-semibold text-[#FF3D00] disabled:opacity-60">
            Stop
          </button>
          <button type="button" onClick={generateFeedback} disabled={isChecking} className="rounded-xl bg-[#5A4DD5] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {isChecking ? 'Checking...' : '✅ Generate Professional Feedback'}
          </button>
        </div>

        <textarea value={transcript} onChange={(event) => setTranscript(event.target.value)} rows={6} className="mt-4 w-full rounded-xl border border-[#d8dbe7] bg-white p-3 text-[#1F2430] outline-none focus:border-[#4ED0FF]" placeholder="Your speech will appear here..." />
        {!speechSupported && <p className="mt-3 text-sm text-[#FF3D00]">Web Speech API is unavailable in this browser. Switch to Chrome or Edge.</p>}
        {message && <p className="mt-3 text-sm text-[#6E7382]">{message}</p>}
      </article>

      <article className="rounded-2xl border border-[#dcefff] bg-white p-5">
        <h2 className="mb-2 text-lg font-semibold text-[#2979FF]">Professional Rewrite</h2>
        <p className="text-[#43506a]">{aiFeedback.professionalRewrite || 'No rewrite yet. Run check after speaking.'}</p>
      </article>

      <article className="rounded-2xl border border-[#dcefff] bg-white p-5">
        <h2 className="mb-3 text-lg font-semibold text-[#5A4DD5]">Why It&apos;s Better</h2>
        {aiFeedback.whyBetter.length === 0 ? (
          <p className="text-[#6E7382]">No improvement points yet. Run check after speaking.</p>
        ) : (
          <ul className="space-y-2">
            {aiFeedback.whyBetter.map((point) => (
              <li key={point} className="rounded-lg bg-[#F5F5F7] px-3 py-2 text-sm text-[#1F2430]">{point}</li>
            ))}
          </ul>
        )}
      </article>

      <article className="rounded-2xl border border-[#dcefff] bg-white p-5">
        <h2 className="mb-3 text-lg font-semibold text-[#00C853]">Alternative Professional Phrases</h2>
        {aiFeedback.alternatives.length === 0 ? (
          <p className="text-[#6E7382]">No alternatives yet.</p>
        ) : (
          <ul className="space-y-2">
            {aiFeedback.alternatives.map((phrase) => (
              <li key={phrase} className="rounded-lg bg-[#F5F5F7] px-3 py-2 text-sm text-[#1F2430]">{phrase}</li>
            ))}
          </ul>
        )}
      </article>
    </section>
  )
}

export default SpeakingActivity

async function requestProfessionalFeedback(text) {
  const prompt = `Rewrite and coach this sentence to be more professional.
Ignore uppercase/lowercase issues and minor spelling mistakes.
Focus on clarity, structure, and stronger thought flow.

Return JSON only with this exact shape:
{
  "professionalRewrite": "string",
  "whyBetter": ["string", "string", "string"],
  "alternatives": ["string", "string", "string"]
}

User text:
${text}`

  const { data } = await sendChatMessage([{ role: 'user', content: prompt }])
  const parsed = parseFeedbackJson(data?.content || '')
  return {
    professionalRewrite: parsed.professionalRewrite || '',
    whyBetter: Array.isArray(parsed.whyBetter) ? parsed.whyBetter.slice(0, 4) : [],
    alternatives: Array.isArray(parsed.alternatives) ? parsed.alternatives.slice(0, 4) : [],
  }
}

function parseFeedbackJson(content) {
  const jsonBlockMatch = content.match(/\{[\s\S]*\}/)
  const raw = jsonBlockMatch ? jsonBlockMatch[0] : content
  try {
    return JSON.parse(raw)
  } catch {
    return {
      professionalRewrite: content.trim(),
      whyBetter: [],
      alternatives: [],
    }
  }
}
