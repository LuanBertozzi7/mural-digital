/**
 * Página de gerenciamento dos posts do usuário autenticado.
 * Permite visualizar o status de moderação, editar e excluir posts próprios.
 * Edições reenviam o post para moderação (volta a PENDING).
 */
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { apiFetch } from '../api'
import { isLoggedIn } from '../auth'
import { useToast } from '../context/ToastContext'
import { CATEGORIES, CATEGORY_LABELS } from '../constants/categories'

const STATUS_BADGE = {
  PENDING: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
  APPROVED: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
  REJECTED: 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
}
const STATUS_LABEL = { PENDING: 'Aguardando', APPROVED: 'Aprovado', REJECTED: 'Rejeitado' }

const INPUT = 'w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

export default function MyPosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    if (!isLoggedIn()) { navigate('/login'); return }
    apiFetch('/api/me/posts')
      .then(setPosts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [navigate])

  function startEdit(post) {
    setEditingId(post.id)
    setEditForm({ title: post.title, description: post.description, category: post.category, neighborhood: post.neighborhood, contact: post.contact ?? '' })
  }

  async function handleSaveEdit(id) {
    setSaving(true)
    try {
      const updated = await apiFetch(`/api/me/posts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(editForm),
      })
      setPosts((prev) => prev.map((p) => p.id === id ? updated : p))
      setEditingId(null)
      toast('Post atualizado! Aguarde a aprovação do moderador.')
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Excluir este post permanentemente?')) return
    try {
      await apiFetch(`/api/me/posts/${id}`, { method: 'DELETE' })
      setPosts((prev) => prev.filter((p) => p.id !== id))
      toast('Post excluído.')
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="min-h-screen animate-fade-up">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-1">Meus posts</h1>
          <p className="text-sm text-gray-400">Acompanhe e gerencie suas publicações</p>
        </div>

        {error && (
          <div role="alert" className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 text-sm mb-5">
            {error}
          </div>
        )}

        {loading && (
          <p aria-busy="true" className="text-gray-400 text-sm text-center py-12">Carregando...</p>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <p className="text-gray-400 text-sm mb-3">Você ainda não publicou nada.</p>
            <Link to="/submit" className="text-sm text-blue-600 font-medium hover:underline">
              Criar primeira publicação →
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {posts.map((p) => (
            <div key={p.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm">
              {editingId === p.id ? (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Título</label>
                    <input value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} className={INPUT} maxLength={200} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Descrição</label>
                    <textarea value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} rows={4} className={`${INPUT} resize-none`} maxLength={2000} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Categoria</label>
                      <select value={editForm.category} onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))} className={INPUT}>
                        {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Bairro</label>
                      <input value={editForm.neighborhood} onChange={(e) => setEditForm((f) => ({ ...f, neighborhood: e.target.value }))} className={INPUT} maxLength={100} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Contato <span className="text-gray-400 font-normal">(opcional)</span></label>
                    <input value={editForm.contact ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, contact: e.target.value }))} maxLength={100} placeholder="WhatsApp ou e-mail" className={INPUT} />
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-400">Editar vai enviar o post para moderação novamente.</p>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleSaveEdit(p.id)}
                      disabled={saving}
                      className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {saving ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      disabled={saving}
                      className="text-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h2 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 leading-snug">{p.title}</h2>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${STATUS_BADGE[p.status]}`}>
                      {STATUS_LABEL[p.status]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">{p.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 pb-4 border-b border-gray-100 dark:border-gray-800 mb-4">
                    <span className="font-medium text-gray-500 dark:text-gray-400">{CATEGORY_LABELS[p.category]}</span>
                    <span>·</span>
                    <span>{p.neighborhood}</span>
                    <span>·</span>
                    <span>{new Date(p.createdAt).toLocaleDateString('pt-BR')}</span>
                    {p.editedAt && <span className="italic">· editado</span>}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => startEdit(p)}
                      aria-label={`Editar post: ${p.title}`}
                      className="text-xs text-blue-600 border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      aria-label={`Excluir post: ${p.title}`}
                      className="text-xs text-red-500 border border-red-200 dark:border-red-800 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Excluir
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
