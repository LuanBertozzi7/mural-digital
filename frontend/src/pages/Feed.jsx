import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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
  const [neighborhoodInput, setNeighborhoodInput] = useState('')
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

  function handleCategoryClick(c) {
    setCategory((prev) => prev === c ? '' : c)
    setPage(1)
  }

  function handleNeighborhoodSearch(e) {
    e.preventDefault()
    setNeighborhood(neighborhoodInput.trim())
    setPage(1)
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-10">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Feed da comunidade</h1>
          <p className="text-sm text-gray-400">Pimenta Bueno — RO</p>
        </div>

        <div className="mb-6 flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => handleCategoryClick(c)}
                className={`text-sm px-3.5 py-1.5 rounded-full border transition-colors ${
                  category === c
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                {CATEGORY_LABELS[c]}
              </button>
            ))}
            {category && (
              <button
                onClick={() => { setCategory(''); setPage(1) }}
                className="text-sm px-3 py-1.5 rounded-full text-gray-400 hover:text-gray-600"
              >
                × limpar
              </button>
            )}
          </div>

          <form onSubmit={handleNeighborhoodSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Filtrar por bairro..."
              value={neighborhoodInput}
              onChange={(e) => setNeighborhoodInput(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Buscar
            </button>
            {neighborhood && (
              <button
                type="button"
                onClick={() => { setNeighborhood(''); setNeighborhoodInput(''); setPage(1) }}
                className="text-sm px-3 py-2 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg bg-white"
              >
                ×
              </button>
            )}
          </form>
        </div>

        {loading && (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/4 mb-3" />
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-full mb-1" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-16 text-red-400 text-sm">{error}</div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm mb-3">Nenhum post encontrado.</p>
            <Link to="/submit" className="text-sm text-blue-600 hover:underline">
              Seja o primeiro a publicar →
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {posts.map((p) => <PostCard key={p.id} post={p} />)}
        </div>

        {posts.length === 20 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="text-sm text-blue-600 border border-blue-200 px-5 py-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Carregar mais
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
