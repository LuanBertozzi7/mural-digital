/**
 * Contexto global de notificações toast.
 *
 * Uso: chame `useToast()` para obter a função `show(message, type?)`.
 * Os toasts desaparecem automaticamente após 3,5 s.
 */
import { createContext, useContext, useState, useCallback } from 'react'

const Ctx = createContext(null)
let _id = 0

/**
 * @param {{ children: React.ReactNode }} props
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  /**
   * Exibe uma notificação toast.
   * @param {string} message - Texto da notificação.
   * @param {'success'|'error'} [type='success'] - Variante visual.
   */
  const show = useCallback((message, type = 'success') => {
    const id = ++_id
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }, [])

  return (
    <Ctx.Provider value={show}>
      {children}
      {/* aria-live="polite" anuncia os toasts para leitores de tela sem interromper o fluxo */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-5 right-5 flex flex-col-reverse gap-2 z-[100] pointer-events-none max-w-[calc(100vw-2.5rem)]"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`animate-slide-up px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 pointer-events-auto ${
              t.type === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-gray-900 text-white dark:bg-gray-50 dark:text-gray-900'
            }`}
          >
            <span
              aria-hidden="true"
              className={t.type === 'error' ? 'text-red-300' : 'text-emerald-400 dark:text-emerald-600'}
            >
              {t.type === 'error' ? '✕' : '✓'}
            </span>
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

/**
 * Hook para disparar notificações toast de qualquer componente filho do ToastProvider.
 * @returns {(message: string, type?: 'success'|'error') => void}
 */
export function useToast() {
  return useContext(Ctx)
}
