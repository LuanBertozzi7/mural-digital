/**
 * Card resumido de um post para exibição no feed.
 * Funciona como link completo para a página de detalhe do post.
 *
 * @param {{ post: { id: number, title: string, description: string, category: string,
 *   neighborhood: string, author: string, authorAvatar?: string, createdAt: string,
 *   editedAt?: string } }} props
 */
import { Link } from 'react-router-dom'
import Avatar from './Avatar'
import { CATEGORY_LABELS, CATEGORY_PILL } from '../constants/categories'

export default function PostCard({ post }) {
  const date = new Date(post.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })

  return (
    <Link
      to={`/post/${post.id}`}
      className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl"
      aria-label={`Ver post: ${post.title}`}
    >
      <article className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-5 shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-3 select-none">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_PILL[post.category]}`}>
            {CATEGORY_LABELS[post.category]}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
            <svg aria-hidden="true" className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate max-w-[120px] sm:max-w-none">{post.neighborhood}</span>
          </span>
          {post.editedAt && (
            <span className="text-xs text-gray-400 dark:text-gray-500 italic">· editado</span>
          )}
        </div>

        <div>
          <h2 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 leading-snug mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {post.title}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">{post.description}</p>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-800 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar user={{ name: post.author, avatarUrl: post.authorAvatar }} size="sm" />
            <span className="font-medium text-gray-500 dark:text-gray-400 truncate">{post.author}</span>
          </div>
          <time dateTime={post.createdAt} className="shrink-0">{date}</time>
        </div>
      </article>
    </Link>
  )
}
