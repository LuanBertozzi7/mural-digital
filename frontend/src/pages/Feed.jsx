import { useState, useEffect } from 'react'
import { apiFetch } from '../api'
import PostCard from '../components/PostCard'

const CATEGORIES = ['VAGAS', 'PERDIDOS', 'PROBLEMAS', 'AVISOS', 'EVENTOS', 'COMPRAS']
const CATEGORY_LABELS = {
  VAGAS: 'Vagas', PERDIDOS: 'Perdidos', PROBLEMAS: 'Problemas',
  AVISOS: 'Avisos', EVENTOS: 'Eventos', COMPRAS: 'Compras',
}

export default function Feed() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [category, setCategory] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({ page })
    if (category) params.set('category', category)
    if (neighborhood) params.set('neighborhood', neighborhood)

    apiFetch(`/api/posts?${params}`)
      .then(setPosts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [category, neighborhood, page])

  function handleFilter(e) {
    e.preventDefault()
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Feed da Comunidade</h1>

        <form onSubmit={handleFilter} className="flex flex-wrap gap-2 mb-6">
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1) }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="">Todas as categorias</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Bairro..."
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-32"
          />
          <button
            type="submit"
            className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Filtrar
          </button>
        </form>

        {loading && <p className="text-gray-500 text-center py-12">Carregando...</p>}
        {error && <p className="text-red-500 text-center py-12">{error}</p>}
        {!loading && !error && posts.length === 0 && (
          <p className="text-gray-400 text-center py-12">Nenhum post encontrado.</p>
        )}

        <div className="flex flex-col gap-4">
          {posts.map((p) => <PostCard key={p.id} post={p} />)}
        </div>

        {posts.length === 20 && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="text-sm text-gray-600 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              Próxima página
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
