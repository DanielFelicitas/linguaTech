import { Link } from 'react-router-dom'

function Home() {
  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-[#d8dbe7] bg-gradient-to-br from-[#f4f2ff] via-[#f7fbff] to-white p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="grid items-start gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="mb-3 inline-block rounded-full bg-[#e9e6ff] px-3 py-1 text-sm font-semibold text-[#5A4DD5]">
              LinguaTech for Grade 11 Learners
            </p>
            <h1 className="max-w-3xl text-3xl font-bold leading-tight text-[#1F2430] sm:text-4xl">
              Improve speaking, writing, and comprehension with modern English practice tools.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-[#6E7382] sm:text-lg">
              Learn through focused activities, instant AI feedback, and guided communication exercises
              designed for real classroom and real-world use.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/activities"
                className="rounded-xl bg-[#5A4DD5] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-105"
              >
                Explore Activities
              </Link>
              <Link
                to="/chat"
                className="rounded-xl border border-[#4ED0FF] bg-white px-5 py-2.5 text-sm font-semibold text-[#0a2f40] transition hover:bg-[#eefbff]"
              >
                Open AI Tutor
              </Link>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-2xl border border-[#dcefff] bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2979FF]">Speaking</p>
              <p className="mt-1 text-sm text-[#43506a]">Speech-to-text with professional feedback.</p>
            </div>
            <div className="rounded-2xl border border-[#dcefff] bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2979FF]">Reading</p>
              <p className="mt-1 text-sm text-[#43506a]">Comprehension quizzes with one-time scoring.</p>
            </div>
            <div className="rounded-2xl border border-[#dcefff] bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2979FF]">Guidance</p>
              <p className="mt-1 text-sm text-[#43506a]">Structured learning for steady progress.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/activities/speaking" className="rounded-2xl border border-[#d8dbe7] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <h2 className="text-lg font-bold text-[#5A4DD5]">Speaking Practice</h2>
          <p className="mt-2 text-sm text-[#6E7382]">Practice pronunciation, fluency, and confident speaking.</p>
        </Link>
        <Link to="/activities/reading" className="rounded-2xl border border-[#d8dbe7] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <h2 className="text-lg font-bold text-[#5A4DD5]">Reading Comprehension</h2>
          <p className="mt-2 text-sm text-[#6E7382]">Take quizzes, submit once, and track your score.</p>
        </Link>
        <Link to="/about" className="rounded-2xl border border-[#d8dbe7] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <h2 className="text-lg font-bold text-[#5A4DD5]">About LinguaTech</h2>
          <p className="mt-2 text-sm text-[#6E7382]">See our mission and how digital tools support learners.</p>
        </Link>
      </div>
    </section>
  )
}

export default Home
