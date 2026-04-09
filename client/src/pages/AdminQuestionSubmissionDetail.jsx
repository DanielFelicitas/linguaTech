import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { deleteReadingAttemptRequest, getAdminReadingAttemptsRequest } from '../services/activityApi'

function AdminQuestionSubmissionDetail() {
  const { quizId } = useParams()
  const [rows, setRows] = useState([])
  const [quizTitle, setQuizTitle] = useState('Quiz')
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')

  const user = JSON.parse(localStorage.getItem('linguatech_user') || 'null')
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    if (!isAdmin) return
    const load = async () => {
      try {
        setIsLoading(true)
        const { data } = await getAdminReadingAttemptsRequest()
        const all = data?.attempts || []
        const filtered = all.filter((item) => (item.quiz?.id || 'deleted-quiz') === quizId)
        setRows(filtered)
        setQuizTitle(filtered[0]?.quiz?.title || 'Deleted quiz')
      } catch (error) {
        setMessage(error.response?.data?.message || 'Failed to load quiz participants.')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [isAdmin, quizId])

  const removeAttempt = async (attempt) => {
    const isConfirmed = window.confirm('Delete this quiz submission?')
    if (!isConfirmed) return
    try {
      await deleteReadingAttemptRequest(attempt.id)
      setRows((prev) => prev.filter((row) => row.id !== attempt.id))
      setMessage('Submission deleted successfully.')
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to delete submission.')
    }
  }

  if (!isAdmin) {
    return <section className="rounded-3xl border border-[#e7e7ee] bg-[#F5F5F7] p-8 shadow-sm">Admin only.</section>
  }

  return (
    <section className="space-y-6 rounded-3xl border border-[#e7e7ee] bg-[#F5F5F7] p-6 shadow-sm sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#5A4DD5]">{quizTitle}</h1>
          <p className="text-sm text-[#6E7382]">Participants for this quiz.</p>
        </div>
        <Link to="/admin/question-submissions" className="rounded-xl border border-[#d8dbe7] bg-white px-4 py-2 text-sm font-semibold text-[#1F2430]">
          ← Back
        </Link>
      </div>

      <section className="rounded-2xl border border-[#d8dbe7] bg-white p-4 sm:p-5">
        {isLoading ? (
          <p className="text-sm text-[#6E7382]">Loading participants...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-[#6E7382]">No submissions for this quiz yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[#f5f7fd] text-[#6E7382]">
                  <th className="border border-[#d8dbe7] px-2 py-2 font-semibold">Student</th>
                  <th className="border border-[#d8dbe7] px-2 py-2 font-semibold">Email</th>
                  <th className="border border-[#d8dbe7] px-2 py-2 font-semibold">Score</th>
                  <th className="border border-[#d8dbe7] px-2 py-2 font-semibold">Submitted At</th>
                  <th className="border border-[#d8dbe7] px-2 py-2 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((attempt) => (
                  <tr key={attempt.id}>
                    <td className="border border-[#d8dbe7] px-2 py-2">{attempt.student?.name || 'Unknown'}</td>
                    <td className="border border-[#d8dbe7] px-2 py-2">{attempt.student?.email || '-'}</td>
                    <td className="border border-[#d8dbe7] px-2 py-2 font-semibold">{attempt.score}/{attempt.total}</td>
                    <td className="border border-[#d8dbe7] px-2 py-2">{attempt.createdAt ? new Date(attempt.createdAt).toLocaleString() : '-'}</td>
                    <td className="border border-[#d8dbe7] px-2 py-2">
                      <button
                        type="button"
                        onClick={() => removeAttempt(attempt)}
                        className="rounded-lg border border-[#FF3D00] px-2 py-1 text-xs font-semibold text-[#FF3D00]"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {message && <p className="text-sm text-[#6E7382]">{message}</p>}
    </section>
  )
}

export default AdminQuestionSubmissionDetail
