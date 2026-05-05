import { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../api'

const INPUT = 'w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await apiFetch('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      setSent(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 animate-fade-up">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="inline-flex w-10 h-10 bg-blue-600 rounded-xl items-center justify-center text-white font-bold text-lg mb-3">M</span>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Esqueceu sua senha?</h1>
          <p className="text-sm text-gray-400 mt-1">
            {sent ? 'Verifique sua caixa de entrada' : 'Informe seu e-mail para receber o link'}
          </p>
        </div>

        {sent ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm text-center">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">E-mail enviado!</p>
            <p className="text-xs text-gray-400 mb-5">
              Se <strong className="text-gray-600 dark:text-gray-300">{email}</strong> estiver cadastrado, você receberá o link em instantes. Verifique também o spam.
            </p>
            <Link to="/login" className="text-sm text-blue-600 font-medium hover:underline">
              Voltar para o login
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg px-4 py-3 text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className={INPUT}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Enviando...' : 'Enviar link de redefinição'}
              </button>
            </form>

            <p className="text-sm text-gray-400 text-center mt-5">
              Lembrou a senha?{' '}
              <Link to="/login" className="text-blue-600 font-medium hover:underline">Entrar</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
