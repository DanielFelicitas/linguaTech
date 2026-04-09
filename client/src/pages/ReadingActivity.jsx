import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getMyReadingAttemptsRequest,
  getReadingQuizzesRequest,
  submitReadingQuizRequest,
} from '../services/activityApi'

function ReadingActivity() {
  const [quizzes, setQuizzes] = useState([])
  const [selectedQuizId, setSelectedQuizId] = useState('')
  const [answersByQuiz, setAnswersByQuiz] = useState({})
  const [attemptsByQuiz, setAttemptsByQuiz] = useState({})
  const [submittingQuizId, setSubmittingQuizId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const [{ data: quizzesData }, { data: attemptsData }] = await Promise.all([
          getReadingQuizzesRequest(),
          getMyReadingAttemptsRequest(),
        ])

        const nextQuizzes = quizzesData?.quizzes || []
        const attemptsMap = (attemptsData?.attempts || []).reduce((acc, attempt) => {
          const key = String(attempt.quiz)
          acc[key] = attempt
          return acc
        }, {})

        setQuizzes(nextQuizzes)
        if (nextQuizzes.length) {
          setSelectedQuizId(String(nextQuizzes[0]._id || nextQuizzes[0].id))
        }
        setAttemptsByQuiz(attemptsMap)
        if (!nextQuizzes.length) {
          setError('No reading quiz yet. Ask an admin to create one.')
        }
      } catch (apiError) {
        setError(apiError.response?.data?.message || 'Failed to load reading quizzes.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const updateAnswer = (quizId, questionIndex, value) => {
    setAnswersByQuiz((prev) => ({
      ...prev,
      [quizId]: { ...(prev[quizId] || {}), [questionIndex]: value },
    }))
  }

  const submitQuiz = async (quiz) => {
    const quizId = String(quiz._id || quiz.id)
    if (attemptsByQuiz[quizId]) return

    const selectedAnswers = answersByQuiz[quizId] || {}
    const hasMissing = quiz.questions.some((_, index) => typeof selectedAnswers[index] !== 'number')
    if (hasMissing) {
      setMessage('Please answer all questions before submitting.')
      return
    }

    try {
      setSubmittingQuizId(quizId)
      setMessage('')
      const answers = quiz.questions.map((_, index) => selectedAnswers[index])
      const { data } = await submitReadingQuizRequest(quizId, { answers })

      setAttemptsByQuiz((prev) => ({ ...prev, [quizId]: data.attempt }))
      setMessage(data.message || 'Quiz submitted successfully.')
    } catch (apiError) {
      const existingAttempt = apiError.response?.data?.attempt
      if (existingAttempt) {
        setAttemptsByQuiz((prev) => ({ ...prev, [quizId]: existingAttempt }))
      }
      setMessage(apiError.response?.data?.message || 'Failed to submit quiz.')
    } finally {
      setSubmittingQuizId('')
    }
  }

  return (
    <section className="space-y-6 rounded-3xl border border-[#e7e7ee] bg-[#F5F5F7] p-8 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="mb-1 text-3xl font-bold text-[#5A4DD5]">📖 Reading + Comprehension</h1>
        </div>
        <Link to="/activities" className="rounded-xl border border-[#d8dbe7] bg-white px-4 py-2 text-sm font-semibold text-[#1F2430]">
          ← Back to Activities
        </Link>
      </div>

      <article className="rounded-2xl border border-[#dcefff] bg-white p-5">
        {loading ? (
          <p className="text-sm text-[#6E7382]">Loading quizzes...</p>
        ) : error ? (
          <p className="text-sm text-[#FF3D00]">{error}</p>
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
              <aside className="space-y-3">
                <p className="text-sm font-semibold text-[#2979FF]">All Reading Quizzes</p>
                {quizzes.map((quiz) => {
                  const quizId = String(quiz._id || quiz.id)
                  const isSelected = selectedQuizId === quizId
                  const attempt = attemptsByQuiz[quizId]
                  return (
                    <button
                      key={quizId}
                      type="button"
                      onClick={() => setSelectedQuizId(quizId)}
                      className={`w-full rounded-xl border p-3 text-left transition ${
                        isSelected
                          ? 'border-[#4ED0FF] bg-[#eefbff]'
                          : 'border-[#e7e7ee] bg-white hover:border-[#4ED0FF]'
                      }`}
                    >
                      <p className="text-sm font-semibold text-[#1F2430]">{quiz.title}</p>
                      <p className="mt-1 text-xs text-[#6E7382]">{quiz.questions?.length || 0} question(s)</p>
                      {attempt && (
                        <p className="mt-1 text-xs font-semibold text-[#5A4DD5]">
                          Score: {attempt.score}/{attempt.total}
                        </p>
                      )}
                    </button>
                  )
                })}
              </aside>

              {quizzes
                .filter((quiz) => String(quiz._id || quiz.id) === selectedQuizId)
                .map((quiz) => {
                  const quizId = String(quiz._id || quiz.id)
                  const attempt = attemptsByQuiz[quizId]
                  const isTaken = Boolean(attempt)

                  return (
                    <section key={quizId} className="rounded-xl border border-[#d8dbe7] p-4">
                      <div className="rounded-xl bg-[#F5F5F7] p-4">
                        <h3 className="mb-2 text-sm font-semibold text-[#2979FF]">{quiz.title}</h3>
                        <p className="whitespace-pre-line text-sm text-[#1F2430]">{quiz.article}</p>
                      </div>

                      <div className="mt-4 space-y-4">
                        {quiz.questions?.map((question, index) => (
                          <QuestionBlock
                            key={`${quizId}-${index}`}
                            id={`${quizId}-q-${index}`}
                            question={`${index + 1}) ${question.question}`}
                            options={question.options.map((option, optionIndex) => ({
                              id: optionIndex,
                              label: option,
                            }))}
                            selected={answersByQuiz[quizId]?.[index]}
                            disabled={isTaken}
                            onSelect={(value) => updateAnswer(quizId, index, value)}
                          />
                        ))}
                      </div>

                      {isTaken ? (
                        <p className="mt-4 text-sm font-semibold text-[#1F2430]">
                          Your score: {attempt.score}/{attempt.total} (already submitted)
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={() => submitQuiz(quiz)}
                          disabled={submittingQuizId === quizId}
                          className="mt-4 rounded-xl bg-[#5A4DD5] px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
                        >
                          {submittingQuizId === quizId ? 'Submitting...' : 'Submit Quiz'}
                        </button>
                      )}
                    </section>
                  )
                })}
            </div>
            {message && <p className="mt-4 text-sm text-[#6E7382]">{message}</p>}
          </>
        )}
      </article>
    </section>
  )
}

export default ReadingActivity

function QuestionBlock({ id, question, options, selected, onSelect, disabled = false }) {
  return (
    <div className="rounded-xl border border-[#e7e7ee] p-3">
      <p className="mb-2 text-sm font-semibold text-[#1F2430]">{question}</p>
      <div className="space-y-2">
        {options.map((option) => (
          <label key={`${id}-${option.id}`} className="flex cursor-pointer items-center gap-2 text-sm text-[#43506a]">
            <input
              type="radio"
              name={id}
              value={option.id}
              checked={selected === option.id}
              disabled={disabled}
              onChange={() => onSelect(option.id)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  )
}
