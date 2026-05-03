import { Link, useNavigate, useLocation } from 'react-router-dom'
import { getUser, isLoggedIn, logout } from '../auth'

function NavLink({ to, children }) {
  const { pathname } = useLocation()
  const active = pathname === to
  return (
    <Link
      to={to}
      className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
        active
          ? 'bg-blue-50 text-blue-700 font-medium'
          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {children}
    </Link>
  )
}

export default function Header() {
  const navigate = useNavigate()
  const user = getUser()

  function handleLogout() {
    logout()
    navigate('/')
    window.location.reload()
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <span className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold select-none">
            M
          </span>
          <span className="font-semibold text-gray-900 text-sm">Mural Digital</span>
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink to="/">Feed</NavLink>
          <NavLink to="/submit">Publicar</NavLink>

          {isLoggedIn() ? (
            <>
              <NavLink to="/me/posts">Meus posts</NavLink>
              {user?.role === 'ADMIN' && (
                <NavLink to="/admin">Moderação</NavLink>
              )}
              <span className="text-gray-300 mx-1">|</span>
              <span className="text-sm text-gray-500 px-1">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-red-500 px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                Sair
              </button>
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
        </nav>
      </div>
    </header>
  )
}
