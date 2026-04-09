import { Link } from 'react-router-dom'

function Activities() {
  return (
    <section className="space-y-6 rounded-3xl border border-[#e7e7ee] bg-[#F5F5F7] p-8 shadow-sm">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-[#5A4DD5]">Activities</h1>
        <p className="text-[#6E7382]">Choose one activity to open it on its own page.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          to="/activities/speaking"
          className="rounded-2xl border border-[#dcefff] bg-white p-5 text-left transition hover:border-[#4ED0FF]"
        >
          <h2 className="mb-1 text-xl font-bold text-[#5A4DD5]">Speaking Practice</h2>
          <p className="text-sm text-[#6E7382]">
            🎤 Speech-to-text and professional sentence feedback.
          </p>
        </Link>

        <Link
          to="/activities/reading"
          className="rounded-2xl border border-[#dcefff] bg-white p-5 text-left transition hover:border-[#4ED0FF]"
        >
          <h2 className="mb-1 text-xl font-bold text-[#5A4DD5]">📖 Reading + Comprehension</h2>
          <p className="text-sm text-[#6E7382]">
            Short article and multiple-choice comprehension questions.
          </p>
        </Link>
      </div>
    </section>
  )
}

export default Activities
