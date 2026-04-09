import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  createOpinionPromptRequest,
  createReadingQuizRequest,
  deleteOpinionPromptRequest,
  deleteReadingQuizRequest,
  getAdminOpinionSubmissionsRequest,
  getAdminReadingAttemptsRequest,
  getOpinionPromptsRequest,
  getReadingQuizzesRequest,
  updateOpinionPromptRequest,
  updateReadingQuizRequest,
} from '../services/activityApi'

const emptyQuestion = () => ({
  question: '',
  options: ['', '', '', ''],
  correctOption: 0,
})

function AdminReadingQuizzes() {
  const [activeManager, setActiveManager] = useState('reading')
  const [quizId, setQuizId] = useState(null)
  const [title, setTitle] = useState('')
  const [article, setArticle] = useState('')
  const [questions, setQuestions] = useState([emptyQuestion()])
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [quizzes, setQuizzes] = useState([])
  const [isLoadingList, setIsLoadingList] = useState(true)
  const [attempts, setAttempts] = useState([])
  const [isLoadingAttempts, setIsLoadingAttempts] = useState(true)
  const [opinionSubmissions, setOpinionSubmissions] = useState([])
  const [isLoadingOpinionSubmissions, setIsLoadingOpinionSubmissions] = useState(true)
  const [prompts, setPrompts] = useState([])
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(true)
  const [promptId, setPromptId] = useState(null)
  const [promptTitle, setPromptTitle] = useState('')
  const [promptInstruction, setPromptInstruction] = useState('')
  const [promptExample, setPromptExample] = useState('')
  const [promptQuestion, setPromptQuestion] = useState('')
  const [isSavingPrompt, setIsSavingPrompt] = useState(false)

  const user = JSON.parse(localStorage.getItem('linguatech_user') || 'null')
  const isAdmin = user?.role === 'admin'

  const loadQuizzes = async () => {
    try {
      setIsLoadingList(true)
      const { data } = await getReadingQuizzesRequest()
      setQuizzes(data?.quizzes || [])
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to load quizzes.')
    } finally {
      setIsLoadingList(false)
    }
  }

  const loadAttempts = async () => {
    try {
      setIsLoadingAttempts(true)
      const { data } = await getAdminReadingAttemptsRequest()
      setAttempts(data?.attempts || [])
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to load student scores.')
    } finally {
      setIsLoadingAttempts(false)
    }
  }

  const loadOpinionSubmissions = async () => {
    try {
      setIsLoadingOpinionSubmissions(true)
      const { data } = await getAdminOpinionSubmissionsRequest()
      setOpinionSubmissions(data?.submissions || [])
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to load opinion submissions.')
    } finally {
      setIsLoadingOpinionSubmissions(false)
    }
  }

  const loadOpinionPrompts = async () => {
    try {
      setIsLoadingPrompts(true)
      const { data } = await getOpinionPromptsRequest()
      setPrompts(data?.prompts || [])
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to load opinion prompts.')
    } finally {
      setIsLoadingPrompts(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      loadQuizzes()
      loadAttempts()
      loadOpinionPrompts()
      loadOpinionSubmissions()
    }
  }, [isAdmin])

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
      const payload = {
        title: title.trim(),
        article: article.trim(),
        questions: cleanedQuestions,
      }
      const { data } = quizId
        ? await updateReadingQuizRequest(quizId, payload)
        : await createReadingQuizRequest(payload)

      setMessage(data.message || (quizId ? 'Quiz updated successfully.' : 'Quiz created successfully.'))
      resetForm()
      await loadQuizzes()
      await loadAttempts()
      await loadOpinionPrompts()
      await loadOpinionSubmissions()
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to save quiz.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setQuizId(null)
    setTitle('')
    setArticle('')
    setQuestions([emptyQuestion()])
  }

  const duplicateQuiz = (quiz) => {
    setQuizId(null)
    setTitle(`${quiz.title || ''} (Copy)`)
    setArticle(quiz.article || '')
    setQuestions(
      (quiz.questions || []).map((q) => ({
        question: q.question || '',
        options: Array.isArray(q.options) ? [...q.options, '', '', '', ''].slice(0, 4) : ['', '', '', ''],
        correctOption: Number.isInteger(q.correctOption) ? q.correctOption : 0,
      })),
    )
    setActiveManager('reading')
    setMessage('Quiz duplicated. You can now edit and save it.')
  }

  const startEdit = (quiz) => {
    setQuizId(quiz._id || quiz.id)
    setTitle(quiz.title || '')
    setArticle(quiz.article || '')
    setQuestions(
      (quiz.questions || []).map((q) => ({
        question: q.question || '',
        options: Array.isArray(q.options) ? [...q.options, '', '', '', ''].slice(0, 4) : ['', '', '', ''],
        correctOption: Number.isInteger(q.correctOption) ? q.correctOption : 0,
      })),
    )
    setMessage('Editing selected quiz.')
  }

  const removeQuiz = async (quiz) => {
    const id = quiz._id || quiz.id
    const isConfirmed = window.confirm(`Delete "${quiz.title}"?`)
    if (!isConfirmed) return

    try {
      await deleteReadingQuizRequest(id)
      setMessage('Quiz deleted successfully.')
      if (quizId === id) resetForm()
      await loadQuizzes()
      await loadAttempts()
      await loadOpinionPrompts()
      await loadOpinionSubmissions()
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to delete quiz.')
    }
  }

  const resetPromptForm = () => {
    setPromptId(null)
    setPromptTitle('')
    setPromptInstruction('')
    setPromptExample('')
    setPromptQuestion('')
  }

  const savePrompt = async (event) => {
    event.preventDefault()
    if (!promptTitle.trim() || !promptInstruction.trim() || !promptExample.trim() || !promptQuestion.trim()) {
      setMessage('Title, instruction, example, and question are required.')
      return
    }

    try {
      setIsSavingPrompt(true)
      const payload = {
        title: promptTitle.trim(),
        instruction: promptInstruction.trim(),
        example: promptExample.trim(),
        question: promptQuestion.trim(),
      }
      const { data } = promptId
        ? await updateOpinionPromptRequest(promptId, payload)
        : await createOpinionPromptRequest(payload)
      setMessage(data.message || (promptId ? 'Opinion prompt updated.' : 'Opinion prompt created.'))
      resetPromptForm()
      await loadOpinionPrompts()
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to save opinion prompt.')
    } finally {
      setIsSavingPrompt(false)
    }
  }

  const editPrompt = (prompt) => {
    setPromptId(prompt._id || prompt.id)
    setPromptTitle(prompt.title || '')
    setPromptInstruction(prompt.instruction || '')
    setPromptExample(prompt.example || '')
    setPromptQuestion(prompt.question || '')
    setActiveManager('opinion')
  }

  const removePrompt = async (prompt) => {
    const id = prompt._id || prompt.id
    const isConfirmed = window.confirm('Delete this opinion prompt?')
    if (!isConfirmed) return
    try {
      await deleteOpinionPromptRequest(id)
      setMessage('Opinion prompt deleted successfully.')
      if (promptId === id) resetPromptForm()
      await loadOpinionPrompts()
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to delete opinion prompt.')
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
          <h1 className="text-2xl font-bold text-[#5A4DD5]">Manage Reading Content</h1>
          <p className="text-sm text-[#6E7382]">Create, update, delete content for Activity 2 and Activity 3.</p>
        </div>
        <Link to="/activities/reading" className="rounded-xl border border-[#d8dbe7] bg-white px-4 py-2 text-sm font-semibold text-[#1F2430]">
          View Reading Activity
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveManager('reading')}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeManager === 'reading'
              ? 'bg-[#5A4DD5] text-white'
              : 'border border-[#d8dbe7] bg-white text-[#1F2430]'
          }`}
        >
          Activity 2 Manager
        </button>
        <button
          type="button"
          onClick={() => setActiveManager('opinion')}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeManager === 'opinion'
              ? 'bg-[#5A4DD5] text-white'
              : 'border border-[#d8dbe7] bg-white text-[#1F2430]'
          }`}
        >
          Activity 3 Manager
        </button>
      </div>

      {activeManager === 'reading' && (
        <>
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-[#d8dbe7] bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-[#2979FF]">{quizId ? 'Edit Quiz' : 'Create New Quiz'}</h2>
          <div className="flex gap-2">
            {quizId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-semibold text-[#5A4DD5]"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </div>
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
            {isSubmitting ? 'Saving...' : quizId ? 'Update Quiz' : 'Create Quiz'}
          </button>
        </div>
      </form>

      <section className="rounded-2xl border border-[#d8dbe7] bg-white p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-[#2979FF]">Existing Quizzes</h2>
        {isLoadingList ? (
          <p className="mt-3 text-sm text-[#6E7382]">Loading quizzes...</p>
        ) : quizzes.length === 0 ? (
          <p className="mt-3 text-sm text-[#6E7382]">No quizzes yet.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {quizzes.map((quiz) => (
              <article
                key={quiz._id || quiz.id}
                className="rounded-xl border border-[#e7e7ee] p-3"
              >
                <p className="text-sm font-semibold text-[#1F2430]">{quiz.title}</p>
                <p className="mt-1 text-xs text-[#6E7382]">
                  {quiz.questions?.length || 0} question(s)
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(quiz)}
                    className="rounded-lg border border-[#4ED0FF] px-3 py-1.5 text-xs font-semibold text-[#0a2f40]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicateQuiz(quiz)}
                    className="rounded-lg border border-[#5A4DD5] px-3 py-1.5 text-xs font-semibold text-[#5A4DD5]"
                  >
                    Duplicate
                  </button>
                  <button
                    type="button"
                    onClick={() => removeQuiz(quiz)}
                    className="rounded-lg border border-[#FF3D00] px-3 py-1.5 text-xs font-semibold text-[#FF3D00]"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      </div>
      </>
      )}

      {activeManager === 'opinion' && (
      <section className="rounded-2xl border border-[#d8dbe7] bg-white p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-[#2979FF]">Activity 3: Opinion Prompts</h2>
        <form onSubmit={savePrompt} className="mt-3 space-y-3">
          <input
            type="text"
            value={promptTitle}
            onChange={(event) => setPromptTitle(event.target.value)}
            className="w-full rounded-xl border border-[#d8dbe7] bg-white px-3 py-2 text-sm text-[#1F2430] outline-none focus:border-[#4ED0FF]"
            placeholder="Title"
            required
          />
          <textarea
            value={promptInstruction}
            onChange={(event) => setPromptInstruction(event.target.value)}
            rows={2}
            className="w-full rounded-xl border border-[#d8dbe7] bg-white p-3 text-sm text-[#1F2430] outline-none focus:border-[#4ED0FF]"
            placeholder="Instruction"
            required
          />
          <textarea
            value={promptExample}
            onChange={(event) => setPromptExample(event.target.value)}
            rows={3}
            className="w-full rounded-xl border border-[#d8dbe7] bg-white p-3 text-sm text-[#1F2430] outline-none focus:border-[#4ED0FF]"
            placeholder="Example Response"
            required
          />
          <textarea
            value={promptQuestion}
            onChange={(event) => setPromptQuestion(event.target.value)}
            rows={2}
            className="w-full rounded-xl border border-[#d8dbe7] bg-white p-3 text-sm text-[#1F2430] outline-none focus:border-[#4ED0FF]"
            placeholder="Question"
            required
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSavingPrompt}
              className="rounded-xl bg-[#5A4DD5] px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
            >
              {isSavingPrompt ? 'Saving...' : promptId ? 'Update Opinion' : 'Add Opinion'}
            </button>
            {promptId && (
              <button
                type="button"
                onClick={resetPromptForm}
                className="rounded-xl border border-[#d8dbe7] px-4 py-2 text-sm font-semibold text-[#1F2430]"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {isLoadingPrompts ? (
          <p className="mt-3 text-sm text-[#6E7382]">Loading opinion prompts...</p>
        ) : prompts.length === 0 ? (
          <p className="mt-3 text-sm text-[#6E7382]">No opinion prompts yet.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {prompts.map((prompt) => (
              <article key={prompt._id || prompt.id} className="rounded-xl border border-[#e7e7ee] p-3">
                <p className="text-xs font-semibold text-[#2979FF]">Title</p>
                <p className="text-sm font-semibold text-[#1F2430]">{prompt.title}</p>
                <p className="text-xs font-semibold text-[#2979FF]">Instruction</p>
                <p className="text-sm text-[#1F2430]">{prompt.instruction}</p>
                <p className="mt-2 text-xs font-semibold text-[#2979FF]">Example</p>
                <p className="text-sm text-[#1F2430]">{prompt.example}</p>
                <p className="mt-2 text-xs font-semibold text-[#2979FF]">Question</p>
                <p className="text-sm text-[#1F2430]">{prompt.question}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => editPrompt(prompt)}
                    className="rounded-lg border border-[#4ED0FF] px-3 py-1.5 text-xs font-semibold text-[#0a2f40]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => removePrompt(prompt)}
                    className="rounded-lg border border-[#FF3D00] px-3 py-1.5 text-xs font-semibold text-[#FF3D00]"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      )}

      <section className="rounded-2xl border border-[#d8dbe7] bg-white p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-[#2979FF]">Student Scores</h2>
        {isLoadingAttempts ? (
          <p className="mt-3 text-sm text-[#6E7382]">Loading student scores...</p>
        ) : attempts.length === 0 ? (
          <p className="mt-3 text-sm text-[#6E7382]">No submissions yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#e7e7ee] text-[#6E7382]">
                  <th className="px-2 py-2 font-semibold">Student</th>
                  <th className="px-2 py-2 font-semibold">Email</th>
                  <th className="px-2 py-2 font-semibold">Quiz</th>
                  <th className="px-2 py-2 font-semibold">Score</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((attempt) => (
                  <tr key={attempt.id} className="border-b border-[#f0f0f4] text-[#1F2430]">
                    <td className="px-2 py-2">{attempt.student?.name || 'Unknown'}</td>
                    <td className="px-2 py-2">{attempt.student?.email || '-'}</td>
                    <td className="px-2 py-2">{attempt.quiz?.title || 'Deleted quiz'}</td>
                    <td className="px-2 py-2 font-semibold">
                      {attempt.score}/{attempt.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {message && <p className="text-sm text-[#6E7382]">{message}</p>}

      <section className="rounded-2xl border border-[#d8dbe7] bg-white p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-[#2979FF]">Opinion Submissions</h2>
        {isLoadingOpinionSubmissions ? (
          <p className="mt-3 text-sm text-[#6E7382]">Loading opinion submissions...</p>
        ) : opinionSubmissions.length === 0 ? (
          <p className="mt-3 text-sm text-[#6E7382]">No opinion submissions yet.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {opinionSubmissions.map((item) => (
              <article key={item.id} className="rounded-xl border border-[#e7e7ee] p-3">
                <p className="text-sm font-semibold text-[#1F2430]">
                  {item.student?.name || 'Unknown'} ({item.student?.email || '-'})
                </p>
                <p className="mt-1 text-xs font-semibold text-[#2979FF]">
                  {item.prompt?.title || 'Untitled Opinion'}
                </p>
                <p className="mt-1 text-xs text-[#6E7382]">{item.prompt?.question || 'No question available'}</p>
                <p className="mt-2 rounded-lg bg-[#F5F5F7] p-3 text-sm text-[#1F2430]">{item.answerText}</p>
                <p className="mt-1 text-xs text-[#6E7382]">Duration: {item.durationSeconds}s</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  )
}

export default AdminReadingQuizzes
