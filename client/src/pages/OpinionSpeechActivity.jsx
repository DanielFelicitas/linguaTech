import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getOpinionPromptsRequest } from '../services/activityApi'

const defaultContent = {
  title: 'Digital Communication and Student Interaction',
  instruction:
    'Please record a one-minute response answering the question below. Speak clearly and organize your ideas before responding.',
  example:
    'I believe digital communication technology helps students communicate more easily. It allows them to share ideas quickly through messaging platforms and social media. However, students should still practice speaking in formal situations to improve their communication skills.',
  question:
    'How has digital communication technology influenced the way students speak and interact with others?',
}

function OpinionSpeechActivity() {
  const [opinionContents, setOpinionContents] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const loadPrompts = async () => {
      try {
        const { data } = await getOpinionPromptsRequest()
        const contents = data?.prompts || []
        setOpinionContents(contents)
      } catch {
        setOpinionContents([])
      } finally {
        setLoading(false)
      }
    }
    loadPrompts()
  }, [])

  return (
    <section className="space-y-6 rounded-3xl border border-[#e7e7ee] bg-[#F5F5F7] p-8 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="mb-1 text-3xl font-bold text-[#5A4DD5]">Activity 1: One-Minute Opinion</h1>
          <p className="text-[#6E7382]">
            Please record a one-minute response answering the question below.
          </p>
        </div>
        <Link to="/activities" className="rounded-xl border border-[#d8dbe7] bg-white px-4 py-2 text-sm font-semibold text-[#1F2430]">
          ← Back to Activities
        </Link>
      </div>

      <article className="rounded-2xl border border-[#dcefff] bg-white p-5">
        <h2 className="text-lg font-semibold text-[#2979FF]">All Opinion Speeches</h2>
        <p className="mt-1 text-sm text-[#6E7382]">
          Click one card to open it on a separate page.
        </p>

        {loading ? (
          <p className="mt-4 text-sm text-[#6E7382]">Loading opinions...</p>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {(opinionContents.length > 0 ? opinionContents : [defaultContent]).map((content, index) => {
              const contentId = String(content._id || content.id || `default-${index}`)
              return (
                <Link
                  key={contentId}
                  to={`/activities/opinion-speech/${contentId}`}
                  className="rounded-xl border border-[#e7e7ee] bg-white p-4 transition hover:border-[#4ED0FF] hover:bg-[#eefbff]"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#2979FF]">Opinion {index + 1}</p>
                  <p className="mt-1 text-sm font-semibold text-[#5A4DD5]">
                    {content.title || `Opinion ${index + 1}`}
                  </p>
                  <p className="mt-3 text-xs font-semibold text-[#5A4DD5]">Open Opinion Speech →</p>
                </Link>
              )
            })}
          </div>
        )}
      </article>
    </section>
  )
}

export default OpinionSpeechActivity
