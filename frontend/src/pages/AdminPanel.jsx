/**
 * Painel de moderação — acessível apenas para usuários com role ADMIN.
 * Permite aprovar, rejeitar e remover posts da comunidade.
 * Redireciona para o feed se o usuário não for administrador.
 */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../api'
import { getUser, isLoggedIn } from '../auth'
import { useToast } from '../context/ToastContext'
import { CATEGORY_LABELS } from '../constants/categories'
import ConfirmModal from '../components/ConfirmModal'

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

export default function AdminPanel() {
  const [posts, setPosts] = useState([])
  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const navigate = useNavigate()
  const toast = useToast()

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
      toast(status === 'APPROVED' ? 'Post aprovado.' : 'Post rejeitado.')
    } catch (e) {
      setActionError(`Erro ao atualizar post ${id}: ${e.message}`)
    } finally {
      setActionLoading(null)
    }
  }

  async function deletePost(id) {
    setConfirmId(null)
    setActionLoading(id + 'del')
    setActionError(null)
    try {
      await apiFetch(`/api/admin/posts/${id}`, { method: 'DELETE' })
      setPosts((prev) => prev.filter((p) => p.id !== id))
      toast('Post removido.')
    } catch (e) {
      setActionError(`Erro ao remover post ${id}: ${e.message}`)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="min-h-screen animate-fade-up">
      <ConfirmModal
        open={confirmId !== null}
        title="Remover post"
        message="Essa ação é permanente e não pode ser desfeita."
        confirmLabel="Remover"
        onConfirm={() => deletePost(confirmId)}
        onCancel={() => setConfirmId(null)}
      />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-1">Moderação</h1>
          <p className="text-sm text-gray-400">
            {statusFilter === 'PENDING' && posts.length > 0
              ? `${posts.length} post${posts.length > 1 ? 's' : ''} aguardando revisão`
              : 'Gerencie os posts da comunidade'}
          </p>
        </div>

        <div role="group" aria-label="Filtrar por status" className="flex gap-2 mb-6 flex-wrap">
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              aria-pressed={statusFilter === opt.value}
              className={`text-sm px-3.5 py-1.5 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
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
          <div role="alert" className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 text-sm mb-5">
            {actionError}
          </div>
        )}

        {loading && (
          <p aria-busy="true" className="text-gray-400 text-sm text-center py-12">Carregando...</p>
        )}
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

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 dark:text-gray-500 pb-4 border-b border-gray-100 dark:border-gray-800 mb-4">
                <span className="font-medium text-gray-500 dark:text-gray-400">{CATEGORY_LABELS[p.category]}</span>
                <span>·</span>
                <span>{p.neighborhood}</span>
                <span>·</span>
                <span>{p.user?.name ?? 'Anônimo'}</span>
                <span>·</span>
                <span>{new Date(p.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>

              <div className="flex gap-2 flex-wrap">
                {p.status !== 'APPROVED' && (
                  <button
                    onClick={() => setStatus(p.id, 'APPROVED')}
                    disabled={!!actionLoading}
                    aria-label={`Aprovar post: ${p.title}`}
                    className="text-xs font-medium bg-emerald-600 text-white px-3.5 py-1.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {actionLoading === p.id + 'APPROVED' ? 'Aprovando...' : 'Aprovar'}
                  </button>
                )}
                {p.status !== 'REJECTED' && (
                  <button
                    onClick={() => setStatus(p.id, 'REJECTED')}
                    disabled={!!actionLoading}
                    aria-label={`Rejeitar post: ${p.title}`}
                    className="text-xs font-medium bg-amber-500 text-white px-3.5 py-1.5 rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {actionLoading === p.id + 'REJECTED' ? 'Rejeitando...' : 'Rejeitar'}
                  </button>
                )}
                <button
                  onClick={() => setConfirmId(p.id)}
                  disabled={!!actionLoading}
                  aria-label={`Remover post: ${p.title}`}
                  className="text-xs font-medium text-red-500 border border-red-200 dark:border-red-800 px-3.5 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ml-auto"
                >
                  {actionLoading === p.id + 'del' ? 'Removendo...' : 'Remover'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
