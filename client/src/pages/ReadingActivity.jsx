import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getReadingQuizzesRequest } from '../services/activityApi'

function ReadingActivity() {
  const [quiz, setQuiz] = useState(null)
  const [readingAnswers, setReadingAnswers] = useState({})
  const [readingResult, setReadingResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const user = useMemo(() => JSON.parse(localStorage.getItem('linguatech_user') || 'null'), [])
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const { data } = await getReadingQuizzesRequest()
        const latestQuiz = data?.quizzes?.[0] || null
        setQuiz(latestQuiz)
        if (!latestQuiz) {
          setError('No reading quiz yet. Ask an admin to create one.')
        }
      } catch (apiError) {
        setError(apiError.response?.data?.message || 'Failed to load reading quiz.')
      } finally {
        setLoading(false)
      }
    }

    loadQuiz()
  }, [])

  const checkReadingAnswers = () => {
    if (!quiz) return

    const score = quiz.questions.reduce(
      (sum, question, index) => sum + (readingAnswers[index] === question.correctOption ? 1 : 0),
      0,
    )
    setReadingResult({ score, total: quiz.questions.length })
  }

  return (
    <section className="space-y-6 rounded-3xl border border-[#e7e7ee] bg-[#F5F5F7] p-8 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="mb-1 text-3xl font-bold text-[#5A4DD5]">📖 Reading + Comprehension</h1>
          <p className="text-[#6E7382]">Read the article and answer the comprehension questions.</p>
          {isAdmin && (
            <Link to="/admin/reading-quizzes" className="mt-2 inline-block text-sm font-semibold text-[#5A4DD5]">
              + Create or manage quizzes
            </Link>
          )}
        </div>
        <Link to="/activities" className="rounded-xl border border-[#d8dbe7] bg-white px-4 py-2 text-sm font-semibold text-[#1F2430]">
          ← Back to Activities
        </Link>
      </div>

      <article className="rounded-2xl border border-[#dcefff] bg-white p-5">
        {loading ? (
          <p className="text-sm text-[#6E7382]">Loading quiz...</p>
        ) : error ? (
          <p className="text-sm text-[#FF3D00]">{error}</p>
        ) : (
          <>
        <div className="rounded-xl bg-[#F5F5F7] p-4">
          <h3 className="mb-2 text-sm font-semibold text-[#2979FF]">{quiz?.title}</h3>
          <p className="whitespace-pre-line text-sm text-[#1F2430]">{quiz?.article}</p>
        </div>

        <div className="mt-4 space-y-4">
          {quiz?.questions?.map((question, index) => (
            <QuestionBlock
              key={`question-${index}`}
              id={`q-${index}`}
              question={`${index + 1}) ${question.question}`}
              options={question.options.map((option, optionIndex) => ({
                id: optionIndex,
                label: option,
              }))}
              selected={readingAnswers[index]}
              onSelect={(value) => setReadingAnswers((prev) => ({ ...prev, [index]: value }))}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={checkReadingAnswers}
          className="mt-4 rounded-xl bg-[#5A4DD5] px-4 py-2 text-sm font-semibold text-white"
        >
          Check Answers
        </button>
        {readingResult && (
          <p className="mt-3 text-sm text-[#1F2430]">
            Score: {readingResult.score}/{readingResult.total}
          </p>
        )}
          </>
        )}
      </article>
    </section>
  )
}

export default ReadingActivity

function QuestionBlock({ id, question, options, selected, onSelect }) {
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
              onChange={() => onSelect(option.id)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  )
}
