/** URL base da API, configurada via variável de ambiente em produção. */
export const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

/**
 * Wrapper sobre fetch que injeta o token de autenticação e serializa erros da API.
 *
 * @param {string} path - Caminho relativo ao BASE (ex: '/api/posts').
 * @param {RequestInit} [options] - Opções do fetch. Quando `body` está presente,
 *   o header Content-Type é definido automaticamente como application/json.
 * @returns {Promise<any>} Dados JSON da resposta.
 * @throws {Error} Erro com a mensagem retornada pela API e propriedade `status` com o HTTP status code.
 */
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
