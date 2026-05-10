/**
 * Exibe o avatar do usuário: foto de perfil quando disponível,
 * ou um círculo com as iniciais do nome como fallback.
 *
 * @param {{ user: { name?: string, avatarUrl?: string } | null, size?: 'sm'|'md'|'lg' }} props
 */
import { BASE } from '../api'

export default function Avatar({ user, size = 'md' }) {
  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-24 h-24 text-2xl',
  }

  const initials = user?.name
    ?.split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '?'

  if (user?.avatarUrl) {
    return (
      <img
        src={`${BASE}${user.avatarUrl}`}
        alt={user.name ? `Foto de ${user.name}` : 'Avatar do usuário'}
        className={`${sizes[size]} rounded-full object-cover shrink-0`}
      />
    )
  }

  return (
    <div
      aria-label={user?.name ? `Iniciais de ${user.name}` : 'Avatar'}
      className={`${sizes[size]} rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold shrink-0 select-none`}
    >
      {initials}
    </div>
  )
}
