import { useState } from 'react'
import { apiFetch } from '../api'
import { isLoggedIn, getUser } from '../auth'

const CATEGORIES = ['VAGAS', 'PERDIDOS', 'PROBLEMAS', 'AVISOS', 'EVENTOS', 'COMPRAS']
const CATEGORY_LABELS = {
  VAGAS: 'Vagas', PERDIDOS: 'Perdidos', PROBLEMAS: 'Problemas',
  AVISOS: 'Avisos', EVENTOS: 'Eventos', COMPRAS: 'Compras',
}

const EMPTY = { title: '', description: '', category: 'AVISOS', neighborhood: '' }

const INPUT = 'w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow'
const LABEL = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'

export default function Submit() {
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const user = getUser()
  const authorLabel = isLoggedIn() && user ? user.name : 'Anônimo'

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      await apiFetch('/api/posts', { method: 'POST', body: JSON.stringify(form) })
      setSuccess(true)
      setForm(EMPTY)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-1">Nova publicação</h1>
          <p className="text-sm text-gray-400">
            Publicando como <span className="font-medium text-gray-600 dark:text-gray-300">{authorLabel}</span>
          </p>
        </div>

        {success && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 rounded-xl px-4 py-4 text-sm mb-6 flex items-start gap-3">
            <span className="mt-0.5">✓</span>
            <div>
              <p className="font-medium">Post enviado!</p>
              <p className="mt-0.5 opacity-80">Aguarde a aprovação de um moderador para aparecer no feed.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm flex flex-col gap-5">
          <div>
            <label className={LABEL}>Título</label>
            <input name="title" value={form.title} onChange={handleChange} required maxLength={200} placeholder="Descreva brevemente..." className={INPUT} />
          </div>

          <div>
            <label className={LABEL}>Descrição</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={5} maxLength={2000} placeholder="Conte mais detalhes..." className={`${INPUT} resize-none`} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Categoria</label>
              <select name="category" value={form.category} onChange={handleChange} className={INPUT}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL}>Bairro</label>
              <input name="neighborhood" value={form.neighborhood} onChange={handleChange} required maxLength={100} placeholder="Ex: Centro" className={INPUT} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="bg-blue-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors mt-1">
            {loading ? 'Enviando...' : 'Publicar'}
          </button>
        </form>
      </div>
    </div>
  )
}
