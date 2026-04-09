import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminOpinionSubmissionsRequest } from '../services/activityApi'

function AdminSpeechSubmissions() {
  const [submissions, setSubmissions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')

  const user = JSON.parse(localStorage.getItem('linguatech_user') || 'null')
  const isAdmin = user?.role === 'admin'
  const groupedSubmissions = useMemo(() => {
    const groups = new Map()
    submissions.forEach((item) => {
      const promptId = item.prompt?.id || 'deleted-opinion'
      const promptTitle = item.prompt?.title || 'Untitled Opinion'
      const promptQuestion = item.prompt?.question || 'No question available'
      if (!groups.has(promptId)) {
        groups.set(promptId, { promptId, promptTitle, promptQuestion, rows: [] })
      }
      groups.get(promptId).rows.push(item)
    })
    return Array.from(groups.values())
  }, [submissions])

  useEffect(() => {
    if (!isAdmin) return

    const loadSubmissions = async () => {
      try {
        setIsLoading(true)
        const { data } = await getAdminOpinionSubmissionsRequest()
        setSubmissions(data?.submissions || [])
      } catch (error) {
        setMessage(error.response?.data?.message || 'Failed to load speech submissions.')
      } finally {
        setIsLoading(false)
      }
    }

    loadSubmissions()
  }, [isAdmin])

  if (!isAdmin) {
    return (
      <section className="rounded-3xl border border-[#e7e7ee] bg-[#F5F5F7] p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-[#5A4DD5]">Admin Only</h1>
        <p className="text-sm text-[#6E7382]">Only admin accounts can view speech submissions.</p>
        <Link to="/" className="mt-4 inline-block text-sm font-semibold text-[#5A4DD5]">
          ← Back Home
        </Link>
      </section>
    )
  }

  return (
    <section className="space-y-6 rounded-3xl border border-[#e7e7ee] bg-[#F5F5F7] p-6 shadow-sm sm:p-8">
      <div>
        <h1 className="text-2xl font-bold text-[#5A4DD5]">Speech Submissions</h1>
        <p className="text-sm text-[#6E7382]">Students' one-minute opinion speech answers for Activity 3.</p>
      </div>

      <section className="rounded-2xl border border-[#d8dbe7] bg-white p-4 sm:p-5">
        {isLoading ? (
          <p className="text-sm text-[#6E7382]">Loading speech submissions...</p>
        ) : submissions.length === 0 ? (
          <p className="text-sm text-[#6E7382]">No speech submissions yet.</p>
        ) : (
          <div className="space-y-3">
            {groupedSubmissions.map((group) => (
              <article key={group.promptId} className="rounded-xl border border-[#d8dbe7] p-4">
                <p className="text-sm font-semibold text-[#1F2430]">{group.promptTitle}</p>
                <p className="mt-1 text-xs text-[#6E7382]">{group.promptQuestion}</p>
                <p className="mt-1 text-xs text-[#6E7382]">
                  {group.rows.length} participant{group.rows.length > 1 ? 's' : ''}
                </p>
                <Link
                  to={`/admin/speech-submissions/${group.promptId}`}
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

export default AdminSpeechSubmissions
