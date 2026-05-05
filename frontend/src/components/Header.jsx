import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { getUser, isLoggedIn, logout } from '../auth'
import Avatar from './Avatar'

function NavLink({ to, children, onClick }) {
  const { pathname } = useLocation()
  const active = pathname === to
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`text-sm px-3 py-2 rounded-lg transition-colors ${
        active
          ? 'bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/30 dark:text-blue-400'
          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      {children}
    </Link>
  )
}

function DropdownItem({ to, onClick, children, danger }) {
  const base = 'block w-full text-left px-4 py-2 text-sm transition-colors'
  const normal = 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
  const red = 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
  const cls = `${base} ${danger ? red : normal}`
  if (to) return <Link to={to} onClick={onClick} className={cls}>{children}</Link>
  return <button onClick={onClick} className={cls}>{children}</button>
}

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const close = () => setOpen(false)

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors ${
          open
            ? 'bg-gray-100 dark:bg-gray-800'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        aria-label="Menu do usuário"
        aria-expanded={open}
      >
        <Avatar user={user} size="sm" />
        <svg
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-52 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden animate-slide-down z-30">
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user?.name}</p>
            {user?.email && (
              <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
            )}
          </div>

          <div className="py-1">
            <DropdownItem to="/me/profile" onClick={close}>Meu perfil</DropdownItem>
            <DropdownItem to="/me/posts" onClick={close}>Meus posts</DropdownItem>
            {user?.role === 'ADMIN' && (
              <DropdownItem to="/admin" onClick={close}>Moderação</DropdownItem>
            )}
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 py-1">
            <DropdownItem danger onClick={() => { close(); onLogout() }}>Sair da conta</DropdownItem>
          </div>
        </div>
      )}
    </div>
  )
}

function DarkToggle() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggle}
      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
      aria-label="Alternar tema"
    >
      {dark ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  )
}

export default function Header() {
  const navigate = useNavigate()
  const [user, setUser] = useState(getUser)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    function onUpdate() { setUser(getUser()) }
    window.addEventListener('userUpdated', onUpdate)
    return () => window.removeEventListener('userUpdated', onUpdate)
  }, [])

  function handleLogout() {
    logout()
    setMenuOpen(false)
    navigate('/')
    window.location.reload()
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link to="/" onClick={closeMenu} className="flex items-center gap-2.5 shrink-0">
          <span className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold select-none">M</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Mural Digital</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          <NavLink to="/">Feed</NavLink>
          <NavLink to="/submit">Publicar</NavLink>

          <div className="flex-1" />

          {isLoggedIn() ? (
            <>
              <UserMenu user={user} onLogout={handleLogout} />
            </>
          ) : (
            <>
              <NavLink to="/login">Entrar</NavLink>
              <Link
                to="/register"
                className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors ml-1"
              >
                Cadastrar
              </Link>
            </>
          )}
          <DarkToggle />
        </nav>

        {/* Mobile: dark toggle + hamburger */}
        <div className="flex items-center gap-1 md:hidden">
          {isLoggedIn() && <Avatar user={user} size="sm" />}
          <DarkToggle />
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
            aria-label="Menu"
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 flex flex-col gap-1 animate-slide-down">
          <NavLink to="/" onClick={closeMenu}>Feed</NavLink>
          <NavLink to="/submit" onClick={closeMenu}>Publicar</NavLink>
          {isLoggedIn() ? (
            <>
              <NavLink to="/me/posts" onClick={closeMenu}>Meus posts</NavLink>
              {user?.role === 'ADMIN' && <NavLink to="/admin" onClick={closeMenu}>Moderação</NavLink>}
              <div className="pt-2 mt-1 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <Link to="/me/profile" onClick={closeMenu} className="flex items-center gap-2">
                  <Avatar user={user} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{user?.name}</p>
                    {user?.email && <p className="text-xs text-gray-400">{user.email}</p>}
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Sair
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-2 pt-1">
              <Link
                to="/login"
                onClick={closeMenu}
                className="flex-1 text-center text-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Entrar
              </Link>
              <Link
                to="/register"
                onClick={closeMenu}
                className="flex-1 text-center text-sm bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Cadastrar
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
