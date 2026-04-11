import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/activities', label: 'Activities' },
  { to: '/chat', label: 'Chat Tutor' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
]

function Layout() {
  const [user, setUser] = useState(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const profileMenuRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('linguatech_token')
    const storedUser = localStorage.getItem('linguatech_user')

    if (!token || !storedUser) {
      setUser(null)
      return
    }

    try {
      setUser(JSON.parse(storedUser))
    } catch (error) {
      setUser(null)
    }
  }, [location.pathname])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  const initials = useMemo(() => {
    if (!user?.name) return 'U'
    return user.name
      .split(' ')
      .map((part) => part[0]?.toUpperCase())
      .join('')
      .slice(0, 2)
  }, [user])

  const visibleNavItems = useMemo(() => {
    return navItems
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('linguatech_token')
    localStorage.removeItem('linguatech_user')
    setUser(null)
    setIsProfileOpen(false)
    navigate('/login')
  }

  useEffect(() => {
    const onClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div className="min-h-screen text-[#1F2430]">
      <header className="border-b border-[#4a3fc0] bg-[#5A4DD5] shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-2xl font-bold tracking-tight text-white">
            LinguaTech
          </Link>
          <nav className="hidden flex-wrap gap-2 md:flex">
            {visibleNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-[#4ED0FF] text-[#0a2f40]'
                      : 'text-white hover:bg-white/15'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              {user ? (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen((prev) => !prev)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4ED0FF] text-xs font-bold text-[#0a2f40] ring-2 ring-white/50"
                    aria-label="Open profile menu"
                  >
                    {initials}
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-[#d8dbe7] bg-white p-3 shadow-lg">
                      <p className="text-sm font-semibold text-[#1F2430]">{user.name || 'User'}</p>
                      <p className="mt-1 text-xs text-[#6E7382]">{user.email}</p>
                      {user.role === 'admin' && (
                        <p className="mt-2 inline-block rounded-full bg-[#e9e6ff] px-2 py-1 text-[11px] font-semibold text-[#5A4DD5]">
                          Admin
                        </p>
                      )}
                      {user.role === 'admin' && (
                        <>
                          <Link
                            to="/admin/reading-quizzes"
                            onClick={() => setIsProfileOpen(false)}
                            className="mt-3 block w-full rounded-lg border border-[#d8dbe7] px-3 py-2 text-center text-sm font-semibold text-[#1F2430] transition hover:bg-[#F5F5F7]"
                          >
                            Manage Content
                          </Link>
                          <Link
                            to="/admin/question-submissions"
                            onClick={() => setIsProfileOpen(false)}
                            className="mt-2 block w-full rounded-lg border border-[#d8dbe7] px-3 py-2 text-center text-sm font-semibold text-[#1F2430] transition hover:bg-[#F5F5F7]"
                          >
                            Question Submissions
                          </Link>
                          <Link
                            to="/admin/speech-submissions"
                            onClick={() => setIsProfileOpen(false)}
                            className="mt-2 block w-full rounded-lg border border-[#d8dbe7] px-3 py-2 text-center text-sm font-semibold text-[#1F2430] transition hover:bg-[#F5F5F7]"
                          >
                            Speech Submissions
                          </Link>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="mt-3 w-full rounded-lg border border-[#d8dbe7] px-3 py-2 text-sm font-semibold text-[#1F2430] transition hover:bg-[#F5F5F7]"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link
                    to="/login"
                    className="rounded-lg border border-white/70 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="rounded-lg bg-[#4ED0FF] px-3 py-2 text-sm font-semibold text-[#0a2f40] transition hover:brightness-105"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/40 text-white transition hover:bg-white/10 md:hidden"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <span className="text-lg leading-none">×</span>
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div
          className={`fixed inset-0 z-30 bg-black/30 transition-opacity duration-300 md:hidden ${
            isMobileMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden={!isMobileMenuOpen}
        >
          <aside
            className={`absolute right-0 top-0 h-full w-[82%] max-w-xs bg-[#5A4DD5] p-4 shadow-xl transition-transform duration-300 ${
              isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Menu</p>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/40 text-white"
                aria-label="Close navigation menu"
              >
                <span className="text-lg leading-none">×</span>
              </button>
            </div>

            <nav className="flex flex-col gap-2">
              {visibleNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive ? 'bg-[#4ED0FF] text-[#0a2f40]' : 'text-white hover:bg-white/15'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="mt-4 border-t border-white/20 pt-4">
              {user ? (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-white">{user.name || 'User'}</p>
                  <p className="text-xs text-white/80">{user.email}</p>
                  {user.role === 'admin' && (
                    <>
                      <Link
                        to="/admin/reading-quizzes"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full rounded-lg bg-white/90 px-3 py-2 text-center text-sm font-semibold text-[#1F2430]"
                      >
                        Manage Content
                      </Link>
                      <Link
                        to="/admin/question-submissions"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full rounded-lg bg-white/90 px-3 py-2 text-center text-sm font-semibold text-[#1F2430]"
                      >
                        Question Submissions
                      </Link>
                      <Link
                        to="/admin/speech-submissions"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full rounded-lg bg-white/90 px-3 py-2 text-center text-sm font-semibold text-[#1F2430]"
                      >
                        Speech Submissions
                      </Link>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-lg bg-white/90 px-3 py-2 text-sm font-semibold text-[#1F2430]"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    className="rounded-lg border border-white/70 px-3 py-2 text-center text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="rounded-lg bg-[#4ED0FF] px-3 py-2 text-center text-sm font-semibold text-[#0a2f40] transition hover:brightness-105"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1400px] px-3 py-6 sm:px-4 sm:py-8 lg:px-5">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
