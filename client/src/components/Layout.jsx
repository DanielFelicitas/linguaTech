import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/activities', label: 'Activities' },
  { to: '/chat', label: 'Chat tutor' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
]

function Layout() {
  const [user, setUser] = useState(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
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

  const initials = useMemo(() => {
    if (!user?.name) return 'U'
    return user.name
      .split(' ')
      .map((part) => part[0]?.toUpperCase())
      .join('')
      .slice(0, 2)
  }, [user])

  const visibleNavItems = useMemo(() => {
    if (user?.role === 'admin') {
      return [...navItems, { to: '/admin/reading-quizzes', label: 'Admin Quiz' }]
    }
    return navItems
  }, [user?.role])

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
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="text-2xl font-bold tracking-tight text-white">
            LinguaTech
          </Link>
          <nav className="flex flex-wrap gap-2">
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
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
