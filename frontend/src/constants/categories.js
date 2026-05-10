/** Lista ordenada das categorias válidas, espelhando o enum do backend. */
export const CATEGORIES = ['VAGAS', 'PERDIDOS', 'PROBLEMAS', 'AVISOS', 'EVENTOS', 'COMPRAS']

/** Mapa de rótulos em português para exibição na interface. */
export const CATEGORY_LABELS = {
  VAGAS: 'Vagas', PERDIDOS: 'Perdidos', PROBLEMAS: 'Problemas',
  AVISOS: 'Avisos', EVENTOS: 'Eventos', COMPRAS: 'Compras',
}

/** Classes Tailwind para a pílula de categoria em cards e detalhes de post. */
export const CATEGORY_PILL = {
  VAGAS:     'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  PERDIDOS:  'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  PROBLEMAS: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  AVISOS:    'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  EVENTOS:   'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  COMPRAS:   'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
}
