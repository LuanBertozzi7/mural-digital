import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../api'
import { getUser, isLoggedIn } from '../auth'

const STATUS_FILTER_OPTIONS = [
  { value: 'PENDING', label: 'Aguardando' },
  { value: 'APPROVED', label: 'Aprovados' },
  { value: 'REJECTED', label: 'Rejeitados' },
  { value: '', label: 'Todos' },
]

const STATUS_BADGE = {
  PENDING: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
  APPROVED: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
  REJECTED: 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
}
const STATUS_LABEL = { PENDING: 'Aguardando', APPROVED: 'Aprovado', REJECTED: 'Rejeitado' }

const CATEGORY_LABEL = {
  VAGAS: 'Vagas', PERDIDOS: 'Perdidos', PROBLEMAS: 'Problemas',
  AVISOS: 'Avisos', EVENTOS: 'Eventos', COMPRAS: 'Compras',
}

export default function AdminPanel() {
  const [posts, setPosts] = useState([])
  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [actionError, setActionError] = useState(null)
  const navigate = useNavigate()

  const fetchPosts = useCallback(() => {
    setLoading(true)
    const params = statusFilter ? `?status=${statusFilter}` : ''
    apiFetch(`/api/admin/posts${params}`)
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [statusFilter])

  useEffect(() => {
    if (!isLoggedIn() || getUser()?.role !== 'ADMIN') { navigate('/'); return }
    fetchPosts()
  }, [navigate, fetchPosts])

  async function setStatus(id, status) {
    setActionLoading(id + status)
    setActionError(null)
    try {
      await apiFetch(`/api/admin/posts/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
      setPosts((prev) => prev.map((p) => p.id === id ? { ...p, status } : p))
    } catch (e) {
      setActionError(`Erro ao atualizar post ${id}: ${e.message}`)
    } finally {
      setActionLoading(null)
    }
  }

  async function deletePost(id) {
    if (!confirm('Remover este post permanentemente?')) return
    setActionLoading(id + 'del')
    setActionError(null)
    try {
      await apiFetch(`/api/admin/posts/${id}`, { method: 'DELETE' })
      setPosts((prev) => prev.filter((p) => p.id !== id))
    } catch (e) {
      setActionError(`Erro ao remover post ${id}: ${e.message}`)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-1">Moderação</h1>
          <p className="text-sm text-gray-400">
            {statusFilter === 'PENDING' && posts.length > 0
              ? `${posts.length} post${posts.length > 1 ? 's' : ''} aguardando revisão`
              : 'Gerencie os posts da comunidade'}
          </p>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`text-sm px-3.5 py-1.5 rounded-full border transition-colors ${
                statusFilter === opt.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {actionError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 text-sm mb-5">
            {actionError}
          </div>
        )}

        {loading && <p className="text-gray-400 text-sm text-center py-12">Carregando...</p>}
        {!loading && posts.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-12">Nenhum post nesta categoria.</p>
        )}

        <div className="flex flex-col gap-4">
          {posts.map((p) => (
            <div key={p.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h2 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 leading-snug">{p.title}</h2>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${STATUS_BADGE[p.status]}`}>
                  {STATUS_LABEL[p.status]}
                </span>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">{p.description}</p>

              <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 pb-4 border-b border-gray-100 dark:border-gray-800 mb-4">
                <span className="font-medium text-gray-500 dark:text-gray-400">{CATEGORY_LABEL[p.category]}</span>
                <span>·</span>
                <span>{p.neighborhood}</span>
                <span>·</span>
                <span>{p.user?.name ?? 'Anônimo'}</span>
                <span>·</span>
                <span>{new Date(p.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>

              <div className="flex gap-2 flex-wrap">
                {p.status !== 'APPROVED' && (
                  <button onClick={() => setStatus(p.id, 'APPROVED')} disabled={!!actionLoading}
                    className="text-xs font-medium bg-emerald-600 text-white px-3.5 py-1.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                    {actionLoading === p.id + 'APPROVED' ? '...' : 'Aprovar'}
                  </button>
                )}
                {p.status !== 'REJECTED' && (
                  <button onClick={() => setStatus(p.id, 'REJECTED')} disabled={!!actionLoading}
                    className="text-xs font-medium bg-amber-500 text-white px-3.5 py-1.5 rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors">
                    {actionLoading === p.id + 'REJECTED' ? '...' : 'Rejeitar'}
                  </button>
                )}
                <button onClick={() => deletePost(p.id)} disabled={!!actionLoading}
                  className="text-xs font-medium text-red-500 border border-red-200 dark:border-red-800 px-3.5 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors ml-auto">
                  {actionLoading === p.id + 'del' ? '...' : 'Remover'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
