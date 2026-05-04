import { useState, useEffect, useRef, useCallback } from 'react'
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
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [category, setCategory] = useState('')
  const [q, setQ] = useState('')
  const [qInput, setQInput] = useState('')

  const sentinelRef = useRef(null)

  // Load posts — replaces on page=1, appends on page>1
  useEffect(() => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({ page })
    if (category) params.set('category', category)
    if (q) params.set('q', q)

    apiFetch(`/api/posts?${params}`)
      .then((newPosts) => {
        setPosts((prev) => page === 1 ? newPosts : [...prev, ...newPosts])
        setHasMore(newPosts.length === 20)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [page, category, q])

  // Intersection observer for infinite scroll
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore && !loading) {
        setPage((p) => p + 1)
      }
    }, { rootMargin: '300px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, loading])

  function resetAndApply(changes) {
    setPosts([])
    setHasMore(true)
    setPage(1)
    if ('category' in changes) setCategory(changes.category)
    if ('q' in changes) setQ(changes.q)
  }

  function handleCategoryClick(c) {
    resetAndApply({ category: category === c ? '' : c })
  }

  function handleSearch(e) {
    e.preventDefault()
    resetAndApply({ q: qInput.trim() })
  }

  function clearSearch() {
    setQInput('')
    resetAndApply({ q: '' })
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-1">Feed da comunidade</h1>
          <p className="text-sm text-gray-400">Pimenta Bueno — RO</p>
        </div>

        <div className="mb-6 flex flex-col gap-3">
          {/* Busca */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar por título, descrição ou bairro..."
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              className="flex-1 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button type="submit" className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Buscar
            </button>
            {q && (
              <button type="button" onClick={clearSearch} className="text-sm px-3 py-2 text-gray-400 hover:text-gray-600 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                ×
              </button>
            )}
          </form>

          {/* Filtros de categoria */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => handleCategoryClick(c)}
                className={`text-sm px-3.5 py-1.5 rounded-full border transition-colors ${
                  category === c
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                {CATEGORY_LABELS[c]}
              </button>
            ))}
            {category && (
              <button onClick={() => resetAndApply({ category: '' })} className="text-sm px-3 py-1.5 rounded-full text-gray-400 hover:text-gray-600">
                × limpar
              </button>
            )}
          </div>

        </div>

        {error && <div className="text-center py-16 text-red-400 text-sm">{error}</div>}

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

        {/* Skeleton loader */}
        {loading && (
          <div className="flex flex-col gap-4 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 animate-pulse">
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/4 mb-3" />
                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full mb-1" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {/* Sentinel para infinite scroll */}
        <div ref={sentinelRef} className="h-4" />

        {!hasMore && posts.length > 0 && (
          <p className="text-center text-xs text-gray-400 mt-4">Todos os posts carregados.</p>
        )}
      </div>
    </div>
  )
}
