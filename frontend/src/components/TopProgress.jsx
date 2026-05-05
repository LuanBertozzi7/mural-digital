import { useState, useEffect } from 'react'

let _pending = 0
let _patched = false

export function initProgress() {
  if (_patched) return
  _patched = true
  const orig = window.fetch
  window.fetch = async (...args) => {
    if (++_pending === 1) window.dispatchEvent(new Event('np:start'))
    try {
      return await orig.apply(window, args)
    } finally {
      if (--_pending === 0) window.dispatchEvent(new Event('np:done'))
    }
  }
}

export default function TopProgress() {
  const [phase, setPhase] = useState('idle')
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const onStart = () => {
      setPhase('running')
      setWidth(0)
      setTimeout(() => setWidth(72), 20)
    }
    const onDone = () => {
      setWidth(100)
      setPhase('done')
      setTimeout(() => { setPhase('idle'); setWidth(0) }, 500)
    }
    window.addEventListener('np:start', onStart)
    window.addEventListener('np:done', onDone)
    return () => {
      window.removeEventListener('np:start', onStart)
      window.removeEventListener('np:done', onDone)
    }
  }, [])

  if (phase === 'idle') return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] h-[2px] pointer-events-none">
      <div
        style={{
          width: `${width}%`,
          transitionProperty: phase === 'done' ? 'width, opacity' : 'width',
          transitionDuration: phase === 'done' ? '0.15s, 0.4s' : '1.8s',
          transitionTimingFunction: phase === 'running' ? 'cubic-bezier(0.1,0.6,0.4,1)' : 'ease-in',
          opacity: phase === 'done' ? 0 : 1,
        }}
        className="h-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.6)]"
      />
    </div>
  )
}
