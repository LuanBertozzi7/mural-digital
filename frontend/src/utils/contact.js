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
