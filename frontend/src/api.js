export const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token')
  const headers = { ...options.headers }
  if (options.body) headers['Content-Type'] = 'application/json'
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const err = new Error(data?.error || 'Erro desconhecido')
    err.status = res.status
    throw err
  }

  return data
}
