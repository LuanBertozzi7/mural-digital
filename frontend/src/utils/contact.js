/**
 * Infere o tipo de contato a partir de uma string livre e retorna os dados
 * necessários para renderizar um link acionável.
 *
 * Regras de detecção (em ordem de prioridade):
 * 1. Contém "@" → e-mail
 * 2. ≥ 8 dígitos → WhatsApp (prefixa DDI 55 se ausente)
 * 3. Qualquer outro valor → telefone genérico
 *
 * @param {string} value - Valor bruto inserido pelo usuário.
 * @returns {{ type: 'email'|'whatsapp'|'phone', href: string, label: string } | null}
 */
export function detectContact(value) {
  if (!value) return null
  const v = value.trim()
  if (v.includes('@')) return { type: 'email', href: `mailto:${v}`, label: v }
  const digits = v.replace(/\D/g, '')
  if (digits.length >= 8) {
    const num = digits.startsWith('55') ? digits : `55${digits}`
    return { type: 'whatsapp', href: `https://wa.me/${num}`, label: v }
  }
  return { type: 'phone', href: `tel:${v}`, label: v }
}
