import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  deleteOpinionSubmissionRequest,
  getAdminOpinionSubmissionsRequest,
  updateOpinionSubmissionFeedbackRequest,
} from '../services/activityApi'

function AdminSpeechSubmissionDetail() {
  const { promptId } = useParams()
  const [rows, setRows] = useState([])
  const [promptTitle, setPromptTitle] = useState('Opinion')
  const [promptQuestion, setPromptQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [feedbackBySubmission, setFeedbackBySubmission] = useState({})

  const user = JSON.parse(localStorage.getItem('linguatech_user') || 'null')
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    if (!isAdmin) return
    const load = async () => {
      try {
        setIsLoading(true)
        const { data } = await getAdminOpinionSubmissionsRequest()
        const all = data?.submissions || []
        const filtered = all.filter((item) => (item.prompt?.id || 'deleted-opinion') === promptId)
        setRows(filtered)
        setPromptTitle(filtered[0]?.prompt?.title || 'Untitled Opinion')
        setPromptQuestion(filtered[0]?.prompt?.question || '')
        setFeedbackBySubmission(
          filtered.reduce((acc, item) => {
            acc[item.id] = item.feedback || ''
            return acc
          }, {}),
        )
      } catch (error) {
        setMessage(error.response?.data?.message || 'Failed to load speech participants.')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [isAdmin, promptId])

  const removeSubmission = async (submission) => {
    const isConfirmed = window.confirm('Delete this speech submission?')
    if (!isConfirmed) return
    try {
      await deleteOpinionSubmissionRequest(submission.id)
      setRows((prev) => prev.filter((item) => item.id !== submission.id))
      setMessage('Submission deleted successfully.')
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to delete submission.')
    }
  }

  const saveFeedback = async (submissionId) => {
    try {
      const { data } = await updateOpinionSubmissionFeedbackRequest(submissionId, {
        feedback: feedbackBySubmission[submissionId] || '',
      })
      setRows((prev) =>
        prev.map((item) =>
          item.id === submissionId ? { ...item, feedback: data?.submission?.feedback || '' } : item,
        ),
      )
      setMessage(data?.message || 'Feedback saved.')
    } catch (error) {
      const fallback = error.response?.data || error.message || 'Unknown error'
      setMessage(
        error.response?.data?.message ||
          `Failed to save feedback. ${typeof fallback === 'string' ? fallback : JSON.stringify(fallback)}`,
      )
    }
  }

  if (!isAdmin) {
    return <section className="rounded-3xl border border-[#e7e7ee] bg-[#F5F5F7] p-8 shadow-sm">Admin only.</section>
  }

  return (
    <section className="space-y-6 rounded-3xl border border-[#e7e7ee] bg-[#F5F5F7] p-6 shadow-sm sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#5A4DD5]">{promptTitle}</h1>
          <p className="text-sm text-[#6E7382]">{promptQuestion || 'Participants for this opinion.'}</p>
        </div>
        <Link to="/admin/speech-submissions" className="rounded-xl border border-[#d8dbe7] bg-white px-4 py-2 text-sm font-semibold text-[#1F2430]">
          ← Back
        </Link>
      </div>

      <section className="rounded-2xl border border-[#d8dbe7] bg-white p-4 sm:p-5">
        {isLoading ? (
          <p className="text-sm text-[#6E7382]">Loading participants...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-[#6E7382]">No submissions for this opinion yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[#f5f7fd] text-[#6E7382]">
                  <th className="border border-[#d8dbe7] px-2 py-2 font-semibold">Student</th>
                  <th className="border border-[#d8dbe7] px-2 py-2 font-semibold">Email</th>
                  <th className="border border-[#d8dbe7] px-2 py-2 font-semibold">Answer</th>
                  <th className="border border-[#d8dbe7] px-2 py-2 font-semibold">Feedback</th>
                  <th className="border border-[#d8dbe7] px-2 py-2 font-semibold">Duration</th>
                  <th className="border border-[#d8dbe7] px-2 py-2 font-semibold">Submitted At</th>
                  <th className="border border-[#d8dbe7] px-2 py-2 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id}>
                    <td className="border border-[#d8dbe7] px-2 py-2">{item.student?.name || 'Unknown'}</td>
                    <td className="border border-[#d8dbe7] px-2 py-2">{item.student?.email || '-'}</td>
                    <td className="max-w-[380px] border border-[#d8dbe7] px-2 py-2 whitespace-pre-wrap">{item.answerText}</td>
                    <td className="border border-[#d8dbe7] px-2 py-2">
                      <textarea
                        value={feedbackBySubmission[item.id] || ''}
                        onChange={(event) =>
                          setFeedbackBySubmission((prev) => ({
                            ...prev,
                            [item.id]: event.target.value,
                          }))
                        }
                        rows={3}
                        className="w-[260px] rounded-lg border border-[#d8dbe7] p-2 text-xs outline-none focus:border-[#4ED0FF]"
                        placeholder="Write feedback for this student..."
                      />
                      <button
                        type="button"
                        onClick={() => saveFeedback(item.id)}
                        className="mt-2 rounded-lg border border-[#5A4DD5] px-2 py-1 text-xs font-semibold text-[#5A4DD5]"
                      >
                        Save Feedback
                      </button>
                    </td>
                    <td className="border border-[#d8dbe7] px-2 py-2">{item.durationSeconds}s</td>
                    <td className="border border-[#d8dbe7] px-2 py-2">{item.createdAt ? new Date(item.createdAt).toLocaleString() : '-'}</td>
                    <td className="border border-[#d8dbe7] px-2 py-2">
                      <button
                        type="button"
                        onClick={() => removeSubmission(item)}
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

export default AdminSpeechSubmissionDetail
