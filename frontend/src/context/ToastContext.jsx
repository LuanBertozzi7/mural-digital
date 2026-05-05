import { createContext, useContext, useState, useCallback } from 'react'

const Ctx = createContext(null)
let _id = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const show = useCallback((message, type = 'success') => {
    const id = ++_id
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }, [])

  return (
    <Ctx.Provider value={show}>
      {children}
      <div className="fixed bottom-5 right-5 flex flex-col-reverse gap-2 z-[100] pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-slide-up px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 pointer-events-auto ${
              t.type === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-gray-900 text-white dark:bg-gray-50 dark:text-gray-900'
            }`}
          >
            <span className={t.type === 'error' ? 'text-red-300' : 'text-emerald-400 dark:text-emerald-600'}>
              {t.type === 'error' ? '✕' : '✓'}
            </span>
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export function useToast() {
  return useContext(Ctx)
}
