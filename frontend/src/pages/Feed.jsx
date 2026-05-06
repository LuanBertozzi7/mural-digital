import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { apiFetch } from '../api'
import PostCard from '../components/PostCard'
import { CATEGORIES, CATEGORY_LABELS } from '../constants/categories'

export default function Feed() {
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [searchParams, setSearchParams] = useSearchParams()
  const [category, setCategory] = useState('')
  const q = searchParams.get('q') || ''

  const sentinelRef = useRef(null)

  // Reset page quando filtros mudam
  useEffect(() => {
    setPosts([])
    setHasMore(true)
    setPage(1)
  }, [q, category])

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

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore && !loading) setPage((p) => p + 1)
    }, { rootMargin: '300px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, loading])

  function handleCategoryClick(c) {
    setCategory((prev) => prev === c ? '' : c)
  }

  function clearAll() {
    setCategory('')
    setSearchParams({})
  }

  const hasFilters = category || q

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-1">Feed da comunidade</h1>
          <p className="text-sm text-gray-400">Pimenta Bueno</p>
        </div>

        <div className="mb-6 flex flex-wrap gap-1 items-center">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => handleCategoryClick(c)}
              className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                category === c
                  ? 'bg-blue-50 text-blue-600 font-medium dark:bg-blue-900/25 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
          {category && (
            <button onClick={clearAll} className="text-xs px-2 py-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              limpar
            </button>
          )}
        </div>

        {error && <div className="text-center py-16 text-red-400 text-sm">{error}</div>}

        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-16">
            {hasFilters ? (
              <>
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">Nenhum resultado encontrado</p>
                <p className="text-gray-400 text-xs mb-4">
                  {q && category
                    ? `"${q}" em ${CATEGORY_LABELS[category]}`
                    : q
                    ? `para "${q}"`
                    : `em ${CATEGORY_LABELS[category]}`}
                </p>
                <button onClick={clearAll} className="text-sm text-blue-600 hover:underline">
                  Limpar filtros
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-400 text-sm mb-3">Nenhum post encontrado.</p>
                <Link to="/submit" className="text-sm text-blue-600 hover:underline">
                  Seja o primeiro a publicar →
                </Link>
              </>
            )}
          </div>
        )}

        <div className="flex flex-col gap-4">
          {posts.map((p, i) => (
            <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}>
              <PostCard post={p} />
            </div>
          ))}
        </div>

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

        <div ref={sentinelRef} className="h-4" />

        {!hasMore && posts.length > 0 && (
          <p className="text-center text-xs text-gray-400 mt-4">Todos os posts carregados.</p>
        )}
      </div>
    </div>
  )
}
