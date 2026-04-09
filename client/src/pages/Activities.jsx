import { Link } from 'react-router-dom'

function Activities() {
  return (
    <section className="space-y-8 rounded-3xl border border-[#e7e7ee] bg-[#F5F5F7] p-6 shadow-sm sm:p-8 lg:p-10">
      <div className="rounded-2xl border border-[#dcefff] bg-white p-6 sm:p-8">
        <p className="mb-3 inline-block rounded-full bg-[#e9e6ff] px-3 py-1 text-sm font-semibold text-[#5A4DD5]">
          Focused Learning Tracks
        </p>
        <h1 className="mb-2 text-3xl font-bold text-[#5A4DD5] sm:text-4xl">Activities</h1>
        <p className="max-w-3xl text-[#6E7382]">
          Choose one activity and work in a distraction-free page. Each track is designed to
          strengthen real English communication skills.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Link
          to="/activities/opinion-speech"
          className="group rounded-2xl border border-[#dcefff] bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-[#4ED0FF] hover:shadow-md sm:p-7"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#2979FF]">
            Activity 01
          </p>
          <h2 className="mb-2 text-2xl font-bold text-[#5A4DD5]">🗣 Opinion Speech</h2>
          <p className="text-base text-[#6E7382]">
            Choose a prompt card and answer it with a one-minute speech recording.
          </p>
          <div className="mt-5 inline-flex rounded-lg border border-[#4ED0FF] px-3 py-2 text-sm font-semibold text-[#0a2f40] transition group-hover:bg-[#eefbff]">
            Open Activity
          </div>
        </Link>

        <Link
          to="/activities/reading"
          className="group rounded-2xl border border-[#dcefff] bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-[#4ED0FF] hover:shadow-md sm:p-7"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#2979FF]">
            Activity 02
          </p>
          <h2 className="mb-2 text-2xl font-bold text-[#5A4DD5]">📖 Reading + Comprehension</h2>
          <p className="text-base text-[#6E7382]">
            Short article and multiple-choice comprehension questions.
          </p>
          <div className="mt-5 inline-flex rounded-lg border border-[#4ED0FF] px-3 py-2 text-sm font-semibold text-[#0a2f40] transition group-hover:bg-[#eefbff]">
            Open Activity
          </div>
        </Link>

        <Link
          to="/activities/speaking"
          className="group rounded-2xl border border-[#dcefff] bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-[#4ED0FF] hover:shadow-md sm:p-7"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#2979FF]">
            Activity 03
          </p>
          <h2 className="mb-2 text-2xl font-bold text-[#5A4DD5]">Speaking Practice</h2>
          <p className="text-base text-[#6E7382]">
            🎤 Speech-to-text and professional sentence feedback.
          </p>
          <div className="mt-5 inline-flex rounded-lg border border-[#4ED0FF] px-3 py-2 text-sm font-semibold text-[#0a2f40] transition group-hover:bg-[#eefbff]">
            Open Activity
          </div>
        </Link>
      </div>
    </section>
  )
}

export default Activities
