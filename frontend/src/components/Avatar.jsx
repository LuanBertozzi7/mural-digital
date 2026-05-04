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
        alt={user.name}
        className={`${sizes[size]} rounded-full object-cover shrink-0`}
      />
    )
  }

  return (
    <div className={`${sizes[size]} rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold shrink-0`}>
      {initials}
    </div>
  )
}
