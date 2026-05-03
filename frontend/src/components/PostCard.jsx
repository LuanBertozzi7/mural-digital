const CATEGORY_LABELS = {
  VAGAS: 'Vagas',
  PERDIDOS: 'Perdidos',
  PROBLEMAS: 'Problemas',
  AVISOS: 'Avisos',
  EVENTOS: 'Eventos',
  COMPRAS: 'Compras',
}

const CATEGORY_COLORS = {
  VAGAS: 'bg-green-100 text-green-800',
  PERDIDOS: 'bg-yellow-100 text-yellow-800',
  PROBLEMAS: 'bg-red-100 text-red-800',
  AVISOS: 'bg-blue-100 text-blue-800',
  EVENTOS: 'bg-purple-100 text-purple-800',
  COMPRAS: 'bg-orange-100 text-orange-800',
}

export default function PostCard({ post }) {
  const date = new Date(post.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric'
  })

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[post.category]}`}>
          {CATEGORY_LABELS[post.category]}
        </span>
        <span className="text-xs text-gray-400">{post.neighborhood}</span>
      </div>
      <h2 className="text-base font-semibold text-gray-900 leading-snug">{post.title}</h2>
      <p className="text-sm text-gray-600 leading-relaxed">{post.description}</p>
      <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-gray-100">
        <span>{post.author}</span>
        <span>{date}</span>
      </div>
    </div>
  )
}
