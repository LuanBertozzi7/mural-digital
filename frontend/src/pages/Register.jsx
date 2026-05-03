import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { apiFetch } from '../api'

const INPUT = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { token, user } = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      navigate('/')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="inline-flex w-10 h-10 bg-blue-600 rounded-xl items-center justify-center text-white font-bold text-lg mb-3">
            M
          </span>
          <h1 className="text-2xl font-bold text-gray-900">Criar conta</h1>
          <p className="text-sm text-gray-400 mt-1">Junte-se à comunidade</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome</label>
            <input name="name" type="text" value={form.name} onChange={handleChange} required className={INPUT} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required className={INPUT} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={6} className={INPUT} />
            <p className="text-xs text-gray-400 mt-1.5">Mínimo 6 caracteres</p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors mt-1"
          >
            {loading ? 'Criando...' : 'Criar conta'}
          </button>
        </form>

        <p className="text-sm text-gray-400 text-center mt-5">
          Já tem conta?{' '}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
