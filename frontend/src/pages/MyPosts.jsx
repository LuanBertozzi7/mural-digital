import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { apiFetch } from '../api'
import { isLoggedIn } from '../auth'

const STATUS_BADGE = {
  PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  REJECTED: 'bg-red-50 text-red-600 border border-red-200',
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
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Meus posts</h1>
          <p className="text-sm text-gray-400">Acompanhe o status das suas publicações</p>
        </div>

        {loading && <p className="text-gray-400 text-sm text-center py-12">Carregando...</p>}
        {error && <p className="text-red-400 text-sm text-center py-12">{error}</p>}

        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-400 text-sm mb-3">Você ainda não publicou nada.</p>
            <Link to="/submit" className="text-sm text-blue-600 font-medium hover:underline">
              Criar primeira publicação →
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {posts.map((p) => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h2 className="text-[15px] font-semibold text-gray-900 leading-snug">{p.title}</h2>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${STATUS_BADGE[p.status]}`}>
                  {STATUS_LABEL[p.status]}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">{p.description}</p>
              <div className="flex items-center gap-3 text-xs text-gray-400 pt-3 border-t border-gray-100">
                <span className="font-medium text-gray-500">{CATEGORY_LABEL[p.category]}</span>
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
