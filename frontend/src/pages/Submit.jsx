import { useState } from 'react'
import { apiFetch } from '../api'
import { isLoggedIn, getUser } from '../auth'

const CATEGORIES = ['VAGAS', 'PERDIDOS', 'PROBLEMAS', 'AVISOS', 'EVENTOS', 'COMPRAS']
const CATEGORY_LABELS = {
  VAGAS: 'Vagas', PERDIDOS: 'Perdidos', PROBLEMAS: 'Problemas',
  AVISOS: 'Avisos', EVENTOS: 'Eventos', COMPRAS: 'Compras',
}

const EMPTY = { title: '', description: '', category: 'AVISOS', neighborhood: '' }

export default function Submit() {
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const user = getUser()
  const authorLabel = isLoggedIn() && user ? `postando como ${user.name}` : 'postando como Anônimo'

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      await apiFetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      setSuccess(true)
      setForm(EMPTY)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Nova publicação</h1>
        <p className="text-sm text-gray-400 mb-6">{authorLabel}</p>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm mb-4">
            Post enviado para moderação. Aguarde aprovação.
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              maxLength={200}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              maxLength={2000}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
              <input
                name="neighborhood"
                value={form.neighborhood}
                onChange={handleChange}
                required
                maxLength={100}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Publicar'}
          </button>
        </form>
      </div>
    </div>
  )
}
