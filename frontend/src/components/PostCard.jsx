const CATEGORY_LABELS = {
  VAGAS: 'Vagas',
  PERDIDOS: 'Perdidos',
  PROBLEMAS: 'Problemas',
  AVISOS: 'Avisos',
  EVENTOS: 'Eventos',
  COMPRAS: 'Compras',
}

const CATEGORY_PILL = {
  VAGAS: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  PERDIDOS: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  PROBLEMAS: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  AVISOS: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  EVENTOS: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  COMPRAS: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
}

const CATEGORY_BORDER = {
  VAGAS: 'border-emerald-300 dark:border-emerald-700',
  PERDIDOS: 'border-amber-300 dark:border-amber-700',
  PROBLEMAS: 'border-red-300 dark:border-red-700',
  AVISOS: 'border-blue-300 dark:border-blue-700',
  EVENTOS: 'border-purple-300 dark:border-purple-700',
  COMPRAS: 'border-orange-300 dark:border-orange-700',
}

export default function PostCard({ post }) {
  const date = new Date(post.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric'
  })

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-xl border ${CATEGORY_BORDER[post.category]} p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3 select-none`}>
      <div className="flex items-center gap-2 flex-wrap">
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
      </div>

      <div>
        <h2 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 leading-snug mb-1">{post.title}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">{post.description}</p>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-800">
        <span className="font-medium text-gray-500 dark:text-gray-400">{post.author}</span>
        <span>{date}</span>
      </div>
    </div>
  )
}
