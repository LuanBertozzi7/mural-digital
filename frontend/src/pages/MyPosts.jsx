import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../api'
import { isLoggedIn } from '../auth'

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

export default function MyPosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoggedIn()) { navigate('/login'); return }

    apiFetch('/api/me/posts')
      .then(setPosts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [navigate])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Meus posts</h1>

        {loading && <p className="text-gray-500 text-center py-12">Carregando...</p>}
        {error && <p className="text-red-500 text-center py-12">{error}</p>}
        {!loading && !error && posts.length === 0 && (
          <p className="text-gray-400 text-center py-12">Você ainda não publicou nada.</p>
        )}

        <div className="flex flex-col gap-4">
          {posts.map((p) => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h2 className="text-base font-semibold text-gray-900">{p.title}</h2>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${STATUS_BADGE[p.status]}`}>
                  {STATUS_LABEL[p.status]}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{p.description}</p>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>{CATEGORY_LABEL[p.category]}</span>
                <span>·</span>
                <span>{p.neighborhood}</span>
                <span>·</span>
                <span>{new Date(p.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
