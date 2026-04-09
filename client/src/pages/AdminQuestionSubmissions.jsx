import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminReadingAttemptsRequest } from '../services/activityApi'

function AdminQuestionSubmissions() {
  const [attempts, setAttempts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')

  const user = JSON.parse(localStorage.getItem('linguatech_user') || 'null')
  const isAdmin = user?.role === 'admin'
  const groupedAttempts = useMemo(() => {
    const groups = new Map()
    attempts.forEach((attempt) => {
      const quizId = attempt.quiz?.id || 'deleted-quiz'
      const quizTitle = attempt.quiz?.title || 'Deleted quiz'
      if (!groups.has(quizId)) {
        groups.set(quizId, { quizId, quizTitle, rows: [] })
      }
      groups.get(quizId).rows.push(attempt)
    })
    return Array.from(groups.values())
  }, [attempts])

  useEffect(() => {
    if (!isAdmin) return

    const loadAttempts = async () => {
      try {
        setIsLoading(true)
        const { data } = await getAdminReadingAttemptsRequest()
        setAttempts(data?.attempts || [])
      } catch (error) {
        setMessage(error.response?.data?.message || 'Failed to load question submissions.')
      } finally {
        setIsLoading(false)
      }
    }

    loadAttempts()
  }, [isAdmin])

  if (!isAdmin) {
    return (
      <section className="rounded-3xl border border-[#e7e7ee] bg-[#F5F5F7] p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-[#5A4DD5]">Admin Only</h1>
        <p className="text-sm text-[#6E7382]">Only admin accounts can view question submissions.</p>
        <Link to="/" className="mt-4 inline-block text-sm font-semibold text-[#5A4DD5]">
          ← Back Home
        </Link>
      </section>
    )
  }

  return (
    <section className="space-y-6 rounded-3xl border border-[#e7e7ee] bg-[#F5F5F7] p-6 shadow-sm sm:p-8">
      <div>
        <h1 className="text-2xl font-bold text-[#5A4DD5]">Question Submissions</h1>
        <p className="text-sm text-[#6E7382]">Students' scores for Activity 2 reading quizzes.</p>
      </div>

      <section className="rounded-2xl border border-[#d8dbe7] bg-white p-4 sm:p-5">
        {isLoading ? (
          <p className="text-sm text-[#6E7382]">Loading student scores...</p>
        ) : attempts.length === 0 ? (
          <p className="text-sm text-[#6E7382]">No question submissions yet.</p>
        ) : (
          <div className="space-y-3">
            {groupedAttempts.map((group) => (
              <article key={group.quizId} className="rounded-xl border border-[#d8dbe7] p-4">
                <p className="text-sm font-semibold text-[#1F2430]">{group.quizTitle}</p>
                <p className="mt-1 text-xs text-[#6E7382]">
                  {group.rows.length} participant{group.rows.length > 1 ? 's' : ''}
                </p>
                <Link
                  to={`/admin/question-submissions/${group.quizId}`}
                  className="mt-3 inline-block rounded-lg border border-[#4ED0FF] px-3 py-1.5 text-xs font-semibold text-[#0a2f40]"
                >
                  View Participants
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      {message && <p className="text-sm text-[#6E7382]">{message}</p>}
    </section>
  )
}

export default AdminQuestionSubmissions
