import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  getMyOpinionSubmissionRequest,
  getOpinionPromptsRequest,
  submitOpinionAnswerRequest,
} from '../services/activityApi'

const defaultContent = {
  title: 'Digital Communication and Student Interaction',
  instruction:
    'Please record a one-minute response answering the question below. Speak clearly and organize your ideas before responding.',
  example:
    'I believe digital communication technology helps students communicate more easily. It allows them to share ideas quickly through messaging platforms and social media. However, students should still practice speaking in formal situations to improve their communication skills.',
  question:
    'How has digital communication technology influenced the way students speak and interact with others?',
}

function OpinionSpeechDetail() {
  const { contentId } = useParams()
  const [content, setContent] = useState(defaultContent)
  const [isListening, setIsListening] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(60)
  const [transcript, setTranscript] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mySubmission, setMySubmission] = useState(null)

  const recognitionRef = useRef(null)
  const timerRef = useRef(null)
  const finalTranscriptRef = useRef('')

  const speechSupported = useMemo(
    () => typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition),
    [],
  )

  useEffect(() => {
    const loadPrompt = async () => {
      try {
        const { data } = await getOpinionPromptsRequest()
        const items = data?.prompts || []
        const selected = items.find((item) => String(item._id || item.id) === contentId)
        if (selected) {
          setContent(selected)
        }
      } catch {
        setContent(defaultContent)
      }
    }
    loadPrompt()
  }, [contentId])

  useEffect(() => {
    const loadMySubmission = async () => {
      if (!contentId || contentId.startsWith('default-')) return
      try {
        const { data } = await getMyOpinionSubmissionRequest(contentId)
        setMySubmission(data?.submission || null)
      } catch {
        setMySubmission(null)
      }
    }
    loadMySubmission()
  }, [contentId])

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const stopSpeaking = () => {
    stopTimer()
    if (recognitionRef.current) recognitionRef.current.stop()
    setIsListening(false)
  }

  const startSpeaking = async () => {
    if (!speechSupported) {
      setMessage('Speech-to-text is not supported in this browser. Please use Chrome or Edge.')
      return
    }
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognitionRef.current = recognition
      recognition.lang = 'en-US'
      recognition.interimResults = true
      recognition.continuous = true

      recognition.onstart = () => {
        setIsListening(true)
        finalTranscriptRef.current = ''
        setTranscript('')
        setSecondsLeft(60)
        setMessage('Listening... speak for 1 minute.')
        timerRef.current = setInterval(() => {
          setSecondsLeft((prev) => {
            if (prev <= 1) {
              stopSpeaking()
              setMessage('1 minute completed. Recording stopped automatically.')
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }

      recognition.onresult = (event) => {
        let interimText = ''
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i]
          const chunk = result[0].transcript || ''
          if (result.isFinal) finalTranscriptRef.current = `${finalTranscriptRef.current} ${chunk}`.trim()
          else interimText = `${interimText} ${chunk}`.trim()
        }
        setTranscript(`${finalTranscriptRef.current} ${interimText}`.trim())
      }

      recognition.onerror = () => {
        setIsListening(false)
        stopTimer()
        setMessage('Speech recognition error. Please try again.')
      }

      recognition.onend = () => {
        setIsListening(false)
        setTranscript(finalTranscriptRef.current.trim())
        stopTimer()
      }

      recognition.start()
    } catch {
      setMessage('Microphone permission denied or unavailable.')
    }
  }

  const submitAnswer = async () => {
    if (!transcript.trim()) {
      setMessage('Please record or type your answer before submitting.')
      return
    }
    if (!contentId || contentId.startsWith('default-')) {
      setMessage('This default opinion cannot be submitted. Please use an admin-created opinion.')
      return
    }

    try {
      setIsSubmitting(true)
      const usedSeconds = Math.max(1, 60 - secondsLeft)
      const { data } = await submitOpinionAnswerRequest(contentId, {
        answerText: transcript.trim(),
        durationSeconds: usedSeconds,
      })
      setMySubmission(data?.submission || null)
      setMessage(data?.message || 'Opinion answer submitted successfully.')
    } catch (error) {
      const existingSubmission = error.response?.data?.submission || null
      if (existingSubmission) {
        setMySubmission(existingSubmission)
      }
      setMessage(error.response?.data?.message || 'Failed to submit opinion answer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="space-y-6 rounded-3xl border border-[#e7e7ee] bg-[#F5F5F7] p-8 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="mb-1 text-3xl font-bold text-[#5A4DD5]">{content.title || 'One-Minute Opinion'}</h1>
          <p className="text-[#6E7382]">This opinion speech is opened on a dedicated page.</p>
        </div>
        <Link to="/activities/opinion-speech" className="rounded-xl border border-[#d8dbe7] bg-white px-4 py-2 text-sm font-semibold text-[#1F2430]">
          ← Back to All Opinions
        </Link>
      </div>

      <article className="rounded-2xl border border-[#dcefff] bg-white p-5">
        <h2 className="text-lg font-semibold text-[#2979FF]">Instructions:</h2>
        <p className="mt-2 text-sm text-[#43506a]">{content.instruction || defaultContent.instruction}</p>

        <h3 className="mt-4 text-base font-semibold text-[#5A4DD5]">Example Response</h3>
        <p className="mt-2 rounded-xl bg-[#F5F5F7] p-3 text-sm text-[#1F2430]">
          &ldquo;{content.example || defaultContent.example}&rdquo;
        </p>

        <h3 className="mt-4 text-base font-semibold text-[#5A4DD5]">Question</h3>
        <p className="mt-2 rounded-xl border border-[#d8dbe7] bg-white p-3 text-sm text-[#1F2430]">
          {content.question || defaultContent.question}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" onClick={startSpeaking} disabled={isListening} className="rounded-xl bg-[#4ED0FF] px-4 py-2 text-sm font-semibold text-[#0a2f40] disabled:opacity-60">
            {isListening ? 'Listening...' : 'Start 1-Minute Answer'}
          </button>
          <button type="button" onClick={stopSpeaking} disabled={!isListening} className="rounded-xl border border-[#FF3D00] px-4 py-2 text-sm font-semibold text-[#FF3D00] disabled:opacity-60">
            Stop
          </button>
          <p className="text-sm font-semibold text-[#5A4DD5]">Time Left: {secondsLeft}s</p>
          <button
            type="button"
            onClick={submitAnswer}
            disabled={isListening || isSubmitting || Boolean(mySubmission)}
            className="rounded-xl bg-[#5A4DD5] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isSubmitting ? 'Submitting...' : mySubmission ? 'Already Submitted' : 'Submit Answer'}
          </button>
        </div>

        <textarea
          value={transcript}
          onChange={(event) => setTranscript(event.target.value)}
          rows={7}
          className="mt-4 w-full rounded-xl border border-[#d8dbe7] bg-white p-3 text-[#1F2430] outline-none focus:border-[#4ED0FF]"
          placeholder="Your one-minute answer will appear here..."
        />
        {mySubmission && (
          <div className="mt-4 rounded-xl border border-[#d8dbe7] bg-[#eefbff] p-3">
            <p className="text-sm font-semibold text-[#2979FF]">Your Submission</p>
            <p className="mt-1 text-sm text-[#1F2430]">
              Duration: {mySubmission.durationSeconds}s
            </p>
            <p className="mt-2 text-sm font-semibold text-[#5A4DD5]">Teacher/Admin Feedback</p>
            <p className="mt-1 text-sm text-[#1F2430]">
              {mySubmission.feedback?.trim() || 'No feedback yet.'}
            </p>
          </div>
        )}
        {message && <p className="mt-3 text-sm text-[#6E7382]">{message}</p>}
      </article>
    </section>
  )
}

export default OpinionSpeechDetail
