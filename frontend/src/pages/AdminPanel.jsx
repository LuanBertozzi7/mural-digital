import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../api'
import { getUser, isLoggedIn } from '../auth'

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'PENDING', label: 'Aguardando' },
  { value: 'APPROVED', label: 'Aprovados' },
  { value: 'REJECTED', label: 'Rejeitados' },
]

const STATUS_BADGE = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
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
    try {
      await apiFetch(`/api/admin/posts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      setPosts((prev) => prev.map((p) => p.id === id ? { ...p, status } : p))
    } finally {
      setActionLoading(null)
    }
  }

  async function deletePost(id) {
    if (!confirm('Remover este post?')) return
    setActionLoading(id + 'del')
    try {
      await apiFetch(`/api/admin/posts/${id}`, { method: 'DELETE' })
      setPosts((prev) => prev.filter((p) => p.id !== id))
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Painel de moderação</h1>

        <div className="flex gap-2 mb-6 flex-wrap">
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                statusFilter === opt.value
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {loading && <p className="text-gray-500 text-center py-12">Carregando...</p>}
        {!loading && posts.length === 0 && (
          <p className="text-gray-400 text-center py-12">Nenhum post encontrado.</p>
        )}

        <div className="flex flex-col gap-4">
          {posts.map((p) => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-1">
                <h2 className="text-base font-semibold text-gray-900">{p.title}</h2>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${STATUS_BADGE[p.status]}`}>
                  {STATUS_LABEL[p.status]}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{p.description}</p>
              <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                <span>{CATEGORY_LABEL[p.category]}</span>
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
                    disabled={actionLoading === p.id + 'APPROVED'}
                    className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    Aprovar
                  </button>
                )}
                {p.status !== 'REJECTED' && (
                  <button
                    onClick={() => setStatus(p.id, 'REJECTED')}
                    disabled={actionLoading === p.id + 'REJECTED'}
                    className="text-xs bg-yellow-600 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                  >
                    Rejeitar
                  </button>
                )}
                <button
                  onClick={() => deletePost(p.id)}
                  disabled={actionLoading === p.id + 'del'}
                  className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
