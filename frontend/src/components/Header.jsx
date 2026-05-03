import { Link, useNavigate } from 'react-router-dom'
import { getUser, isLoggedIn, logout } from '../auth'

export default function Header() {
  const navigate = useNavigate()
  const user = getUser()

  function handleLogout() {
    logout()
    navigate('/')
    window.location.reload()
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <Link to="/" className="text-lg font-bold text-gray-900">
        Mural Digital
      </Link>
      <nav className="flex items-center gap-3">
        <Link to="/submit" className="text-sm text-gray-600 hover:text-gray-900">
          Publicar
        </Link>
        {isLoggedIn() ? (
          <>
            <Link to="/me/posts" className="text-sm text-gray-600 hover:text-gray-900">
              Meus posts
            </Link>
            {user?.role === 'ADMIN' && (
              <Link to="/admin" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Admin
              </Link>
            )}
            <span className="text-sm text-gray-500">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Sair
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">
              Entrar
            </Link>
            <Link
              to="/register"
              className="text-sm bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700"
            >
              Cadastrar
            </Link>
          </>
        )}
      </nav>
    </header>
  )
}
