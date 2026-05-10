/**
 * Retorna o objeto do usuário autenticado persistido no localStorage.
 * @returns {{ id: number, name: string, email: string, role: string, avatarUrl?: string } | null}
 */
export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user'))
  } catch {
    return null
  }
}

/**
 * Verifica se existe um token de autenticação ativo na sessão local.
 * Não valida a assinatura do token — apenas a presença da chave.
 * @returns {boolean}
 */
export function isLoggedIn() {
  return Boolean(localStorage.getItem('token'))
}

/** Remove token e dados do usuário do localStorage (logout local). */
export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}
