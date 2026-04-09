import { useState } from 'react'
import { Link } from 'react-router-dom'
import { createReadingQuizRequest } from '../services/activityApi'

const emptyQuestion = () => ({
  question: '',
  options: ['', '', '', ''],
  correctOption: 0,
})

function AdminReadingQuizzes() {
  const [title, setTitle] = useState('')
  const [article, setArticle] = useState('')
  const [questions, setQuestions] = useState([emptyQuestion()])
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const user = JSON.parse(localStorage.getItem('linguatech_user') || 'null')
  const isAdmin = user?.role === 'admin'

  const updateQuestion = (index, field, value) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === index ? { ...q, [field]: value } : q)),
    )
  }

  const updateOption = (questionIndex, optionIndex, value) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== questionIndex) return q
        const nextOptions = [...q.options]
        nextOptions[optionIndex] = value
        return { ...q, options: nextOptions }
      }),
    )
  }

  const addQuestion = () => setQuestions((prev) => [...prev, emptyQuestion()])

  const removeQuestion = (index) => {
    setQuestions((prev) => {
      if (prev.length === 1) return prev
      return prev.filter((_, idx) => idx !== index)
    })
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setMessage('')

    const cleanedQuestions = questions.map((q) => ({
      question: q.question.trim(),
      options: q.options.map((opt) => opt.trim()).filter(Boolean),
      correctOption: Number(q.correctOption),
    }))

    if (!title.trim() || !article.trim()) {
      setMessage('Title and article are required.')
      return
    }

    const hasInvalidQuestion = cleanedQuestions.some(
      (q) =>
        !q.question ||
        q.options.length < 2 ||
        q.correctOption < 0 ||
        q.correctOption >= q.options.length,
    )

    if (hasInvalidQuestion) {
      setMessage('Each question needs text, at least two options, and a valid correct answer.')
      return
    }

    try {
      setIsSubmitting(true)
      const { data } = await createReadingQuizRequest({
        title: title.trim(),
        article: article.trim(),
        questions: cleanedQuestions,
      })

      setMessage(data.message || 'Quiz created successfully.')
      setTitle('')
      setArticle('')
      setQuestions([emptyQuestion()])
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to create quiz.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAdmin) {
    return (
      <section className="rounded-3xl border border-[#e7e7ee] bg-[#F5F5F7] p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-[#5A4DD5]">Admin Only</h1>
        <p className="text-sm text-[#6E7382]">Only admin accounts can create reading quizzes.</p>
        <Link to="/" className="mt-4 inline-block text-sm font-semibold text-[#5A4DD5]">
          ← Back Home
        </Link>
      </section>
    )
  }

  return (
    <section className="space-y-6 rounded-3xl border border-[#e7e7ee] bg-[#F5F5F7] p-6 shadow-sm sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#5A4DD5]">Create Reading Quiz</h1>
          <p className="text-sm text-[#6E7382]">Admins can publish quizzes for learners.</p>
        </div>
        <Link to="/activities/reading" className="rounded-xl border border-[#d8dbe7] bg-white px-4 py-2 text-sm font-semibold text-[#1F2430]">
          View Reading Activity
        </Link>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="mb-1 block text-sm font-semibold text-[#1F2430]">Quiz Title</label>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-xl border border-[#d8dbe7] bg-white px-3 py-2 text-sm text-[#1F2430] outline-none focus:border-[#4ED0FF]"
            placeholder="Example: Daily English Practice"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-[#1F2430]">Article / Story</label>
          <textarea
            value={article}
            onChange={(event) => setArticle(event.target.value)}
            rows={6}
            className="w-full rounded-xl border border-[#d8dbe7] bg-white p-3 text-sm text-[#1F2430] outline-none focus:border-[#4ED0FF]"
            placeholder="Write the reading passage learners will study..."
            required
          />
        </div>

        <div className="space-y-4">
          {questions.map((question, questionIndex) => (
            <div key={`q-${questionIndex}`} className="rounded-2xl border border-[#d8dbe7] bg-white p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-[#2979FF]">Question {questionIndex + 1}</h2>
                <button
                  type="button"
                  onClick={() => removeQuestion(questionIndex)}
                  className="text-xs font-semibold text-[#FF3D00]"
                >
                  Remove
                </button>
              </div>

              <input
                type="text"
                value={question.question}
                onChange={(event) =>
                  updateQuestion(questionIndex, 'question', event.target.value)
                }
                className="mb-3 w-full rounded-xl border border-[#d8dbe7] px-3 py-2 text-sm text-[#1F2430] outline-none focus:border-[#4ED0FF]"
                placeholder="Enter question text"
                required
              />

              <div className="grid gap-2 sm:grid-cols-2">
                {question.options.map((option, optionIndex) => (
                  <input
                    key={`q-${questionIndex}-opt-${optionIndex}`}
                    type="text"
                    value={option}
                    onChange={(event) => updateOption(questionIndex, optionIndex, event.target.value)}
                    className="w-full rounded-xl border border-[#d8dbe7] px-3 py-2 text-sm text-[#1F2430] outline-none focus:border-[#4ED0FF]"
                    placeholder={`Option ${optionIndex + 1}`}
                    required={optionIndex < 2}
                  />
                ))}
              </div>

              <div className="mt-3">
                <label className="mb-1 block text-xs font-semibold text-[#6E7382]">Correct Option</label>
                <select
                  value={question.correctOption}
                  onChange={(event) =>
                    updateQuestion(questionIndex, 'correctOption', Number(event.target.value))
                  }
                  className="rounded-xl border border-[#d8dbe7] px-3 py-2 text-sm text-[#1F2430] outline-none focus:border-[#4ED0FF]"
                >
                  {question.options.map((_, optionIndex) => (
                    <option key={`correct-${questionIndex}-${optionIndex}`} value={optionIndex}>
                      Option {optionIndex + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addQuestion}
          className="rounded-xl border border-[#4ED0FF] px-4 py-2 text-sm font-semibold text-[#0a2f40]"
        >
          + Add Question
        </button>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-[#5A4DD5] px-5 py-2 text-sm font-semibold text-white disabled:opacity-70"
          >
            {isSubmitting ? 'Creating...' : 'Create Quiz'}
          </button>
        </div>
      </form>

      {message && <p className="text-sm text-[#6E7382]">{message}</p>}
    </section>
  )
}

export default AdminReadingQuizzes
