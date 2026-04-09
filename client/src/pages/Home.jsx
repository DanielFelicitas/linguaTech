import { Link } from 'react-router-dom'

function Home() {
  return (
    <section className="space-y-6">
      <div className="grid gap-8 rounded-3xl border border-[#e7e7ee] bg-[#F5F5F7] p-6 shadow-sm sm:p-8 lg:grid-cols-2">
        <div>
          <p className="mb-3 inline-block rounded-full bg-[#e9e6ff] px-3 py-1 text-sm font-semibold text-[#5A4DD5]">
            Smart English Learning Platform
          </p>
          <h1 className="mb-4 text-3xl font-bold leading-tight text-[#1F2430] sm:text-4xl">
            Build professional English communication with daily practice.
          </h1>
          <p className="text-base text-[#6E7382] sm:text-lg">
            LinguaTech helps students improve speaking and comprehension with focused activities,
            practical feedback, and structured learning paths.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/activities"
              className="rounded-xl bg-[#5A4DD5] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-105"
            >
              Start Activities
            </Link>
            <Link
              to="/chat"
              className="rounded-xl border border-[#4ED0FF] bg-white px-5 py-2.5 text-sm font-semibold text-[#0a2f40] transition hover:bg-[#eefbff]"
            >
              Ask AI Tutor
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-[#dcefff] bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold text-[#5A4DD5]">What you can do here</h2>
          <ul className="space-y-3 text-sm text-[#43506a] sm:text-base">
            <li>• Practice speaking with speech-to-text</li>
            <li>• Get professional sentence improvement feedback</li>
            <li>• Complete reading comprehension quizzes</li>
            <li>• Learn with your AI English tutor anytime</li>
          </ul>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[#d8dbe7] bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#2979FF]">Speaking Practice</p>
          <p className="mt-2 text-sm text-[#6E7382]">
            Train your pronunciation and convert speech to text for instant review.
          </p>
        </div>
        <div className="rounded-2xl border border-[#d8dbe7] bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#2979FF]">Reading Skills</p>
          <p className="mt-2 text-sm text-[#6E7382]">
            Read curated passages and answer quizzes to improve understanding.
          </p>
        </div>
        <div className="rounded-2xl border border-[#d8dbe7] bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#2979FF]">Guided Progress</p>
          <p className="mt-2 text-sm text-[#6E7382]">
            Follow a consistent learning routine and strengthen confidence over time.
          </p>
        </div>
      </div>
    </section>
  )
}

export default Home
