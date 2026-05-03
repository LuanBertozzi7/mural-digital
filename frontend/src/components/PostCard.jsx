const CATEGORY_LABELS = {
  VAGAS: 'Vagas',
  PERDIDOS: 'Perdidos',
  PROBLEMAS: 'Problemas',
  AVISOS: 'Avisos',
  EVENTOS: 'Eventos',
  COMPRAS: 'Compras',
}

const CATEGORY_PILL = {
  VAGAS: 'bg-emerald-50 text-emerald-700',
  PERDIDOS: 'bg-amber-50 text-amber-700',
  PROBLEMAS: 'bg-red-50 text-red-700',
  AVISOS: 'bg-blue-50 text-blue-700',
  EVENTOS: 'bg-purple-50 text-purple-700',
  COMPRAS: 'bg-orange-50 text-orange-700',
}

const CATEGORY_BORDER = {
  VAGAS: 'border-emerald-300',
  PERDIDOS: 'border-amber-300',
  PROBLEMAS: 'border-red-300',
  AVISOS: 'border-blue-300',
  EVENTOS: 'border-purple-300',
  COMPRAS: 'border-orange-300',
}

export default function PostCard({ post }) {
  const date = new Date(post.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric'
  })

  return (
    <div className={`bg-white rounded-xl border ${CATEGORY_BORDER[post.category]} p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3`}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_PILL[post.category]}`}>
          {CATEGORY_LABELS[post.category]}
        </span>
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {post.neighborhood}
        </span>
      </div>

      <div>
        <h2 className="text-[15px] font-semibold text-gray-900 leading-snug mb-1">{post.title}</h2>
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{post.description}</p>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
        <span className="font-medium text-gray-500">{post.author}</span>
        <span>{date}</span>
      </div>
    </div>
  )
}
