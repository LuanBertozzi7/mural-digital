/**
 * Página de criação de novo post.
 * Posts são enviados com status PENDING e precisam ser aprovados por um moderador.
 * Usuários não autenticados publicam como "Anônimo".
 */
import { useState } from 'react'
import { apiFetch } from '../api'
import { isLoggedIn, getUser } from '../auth'
import { useToast } from '../context/ToastContext'
import { CATEGORIES, CATEGORY_LABELS } from '../constants/categories'

const EMPTY = { title: '', description: '', category: 'AVISOS', neighborhood: '', contact: '' }

const INPUT = 'w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow'
const LABEL = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'

export default function Submit() {
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const toast = useToast()

  const user = getUser()
  const authorLabel = isLoggedIn() && user ? user.name : 'Anônimo'

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await apiFetch('/api/posts', { method: 'POST', body: JSON.stringify(form) })
      setForm(EMPTY)
      toast('Post enviado! Aguarde a aprovação de um moderador.')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen animate-fade-up">
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-1">Nova publicação</h1>
          <p className="text-sm text-gray-400">
            Publicando como <span className="font-medium text-gray-600 dark:text-gray-300">{authorLabel}</span>
          </p>
        </div>

        {error && (
          <div role="alert" className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm flex flex-col gap-5">
          <div>
            <label htmlFor="post-title" className={LABEL}>Título</label>
            <input
              id="post-title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              maxLength={200}
              placeholder="Descreva brevemente..."
              className={INPUT}
            />
          </div>

          <div>
            <label htmlFor="post-description" className={LABEL}>Descrição</label>
            <textarea
              id="post-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={5}
              maxLength={2000}
              placeholder="Conte mais detalhes..."
              className={`${INPUT} resize-none`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="post-category" className={LABEL}>Categoria</label>
              <select id="post-category" name="category" value={form.category} onChange={handleChange} className={INPUT}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="post-neighborhood" className={LABEL}>Bairro</label>
              <input
                id="post-neighborhood"
                name="neighborhood"
                value={form.neighborhood}
                onChange={handleChange}
                required
                maxLength={100}
                placeholder="Ex: Centro"
                className={INPUT}
              />
            </div>
          </div>

          <div>
            <label htmlFor="post-contact" className={LABEL}>
              Contato <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              id="post-contact"
              name="contact"
              value={form.contact}
              onChange={handleChange}
              maxLength={100}
              placeholder="WhatsApp (ex: 69999991234) ou e-mail"
              className={INPUT}
            />
            <p className="text-xs text-gray-400 mt-1.5">Aparece apenas na página do post, não no feed.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-1"
          >
            {loading ? 'Enviando...' : 'Publicar'}
          </button>
        </form>
      </div>
    </div>
  )
}
