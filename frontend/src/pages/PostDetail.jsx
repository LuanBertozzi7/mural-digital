import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { apiFetch } from '../api'
import Avatar from '../components/Avatar'

const CATEGORY_LABELS = {
  VAGAS: 'Vagas', PERDIDOS: 'Perdidos', PROBLEMAS: 'Problemas',
  AVISOS: 'Avisos', EVENTOS: 'Eventos', COMPRAS: 'Compras',
}

const CATEGORY_PILL = {
  VAGAS:     'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  PERDIDOS:  'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  PROBLEMAS: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  AVISOS:    'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  EVENTOS:   'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  COMPRAS:   'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
}

export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    apiFetch(`/api/posts/${id}`)
      .then(setPost)
      .catch((e) => {
        if (e.status === 404) navigate('/', { replace: true })
        else setError(e.message)
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-16" />
            <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded w-3/4 mt-6" />
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full" />
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-5/6" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-sm mb-3">{error}</p>
          <Link to="/" className="text-sm text-blue-600 hover:underline">← Voltar ao feed</Link>
        </div>
      </div>
    )
  }

  if (!post) return null

  const date = new Date(post.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  return (
    <div className="min-h-screen animate-fade-up">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mb-8 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar ao feed
        </Link>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-7">
          <div className="flex items-center gap-2 mb-5">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_PILL[post.category]}`}>
              {CATEGORY_LABELS[post.category]}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {post.neighborhood}
            </span>
            {post.editedAt && (
              <span className="text-xs text-gray-400 dark:text-gray-500 italic">· editado</span>
            )}
          </div>

          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50 leading-snug mb-4">
            {post.title}
          </h1>

          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap mb-7">
            {post.description}
          </p>

          <div className="flex items-center justify-between pt-5 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2.5">
              <Avatar user={{ name: post.author, avatarUrl: post.authorAvatar }} size="sm" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{post.author}</span>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500">{date}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
