import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { apiFetch } from '../api'
import Avatar from '../components/Avatar'
import { useToast } from '../context/ToastContext'

function detectContact(value) {
  if (!value) return null
  const v = value.trim()
  if (v.includes('@')) return { type: 'email', href: `mailto:${v}`, label: v }
  const digits = v.replace(/\D/g, '')
  if (digits.length >= 8) {
    const num = digits.startsWith('55') ? digits : `55${digits}`
    return { type: 'whatsapp', href: `https://wa.me/${num}`, label: v }
  }
  return { type: 'phone', href: `tel:${v}`, label: v }
}

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
  const toast = useToast()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, text: post.description.slice(0, 100), url })
      } catch {}
    } else {
      await navigator.clipboard.writeText(url)
      toast('Link copiado!')
    }
  }

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

          {post.contact && (() => {
            const c = detectContact(post.contact)
            return (
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl mb-2">
                {c.type === 'whatsapp' ? (
                  <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                ) : c.type === 'email' ? (
                  <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                )}
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Contato</p>
                  <a href={c.href} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                    {c.label}
                  </a>
                </div>
              </div>
            )
          })()}

          <div className="flex items-center justify-between pt-5 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2.5">
              <Avatar user={{ name: post.author, avatarUrl: post.authorAvatar }} size="sm" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{post.author}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 dark:text-gray-500">{date}</span>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label="Compartilhar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Compartilhar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
