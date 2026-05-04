import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../api'
import { isLoggedIn, getUser } from '../auth'

const BASE = 'http://localhost:3000'
const INPUT = 'w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow'
const LABEL = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ name: '', neighborhood: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoggedIn()) { navigate('/login'); return }
    apiFetch('/api/me/profile')
      .then((data) => {
        setProfile(data)
        setForm({ name: data.name, neighborhood: data.neighborhood ?? '' })
        if (data.avatarUrl) setAvatarPreview(BASE + data.avatarUrl)
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [navigate])

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarPreview(URL.createObjectURL(file))
    setUploading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      const body = new FormData()
      body.append('file', file)
      const res = await fetch(`${BASE}/api/me/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const user = getUser()
      const updated = { ...user, avatarUrl: data.avatarUrl }
      localStorage.setItem('user', JSON.stringify(updated))
      window.dispatchEvent(new Event('userUpdated'))
      setProfile((p) => ({ ...p, avatarUrl: data.avatarUrl }))
    } catch (e) {
      setError(e.message)
      setAvatarPreview(profile?.avatarUrl ? BASE + profile.avatarUrl : null)
    } finally {
      setUploading(false)
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const updated = await apiFetch('/api/me/profile', {
        method: 'PATCH',
        body: JSON.stringify({ name: form.name.trim(), neighborhood: form.neighborhood.trim() }),
      })
      setProfile(updated)
      const user = getUser()
      localStorage.setItem('user', JSON.stringify({ ...user, name: updated.name }))
      window.dispatchEvent(new Event('userUpdated'))
      setSuccess(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Carregando...</p>
      </div>
    )
  }

  const initials = profile?.name?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="min-h-screen">
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-1">Meu perfil</h1>
          <p className="text-sm text-gray-400">Gerencie suas informações pessoais</p>
        </div>

        {/* Avatar */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="relative group"
            aria-label="Alterar foto de perfil"
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-28 h-28 rounded-full object-cover ring-4 ring-white dark:ring-gray-900 shadow-md"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-semibold ring-4 ring-white dark:ring-gray-900 shadow-md select-none">
                {initials}
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {uploading ? (
                <svg className="w-7 h-7 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>
        <p className="text-center text-xs text-gray-400 -mt-4 mb-8">Clique na foto para alterar · JPG, PNG, WebP ou GIF · máx. 2MB</p>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 text-sm mb-5">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 rounded-xl px-4 py-3 text-sm mb-5 flex items-center gap-2">
            <span>✓</span> Perfil atualizado com sucesso.
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm flex flex-col gap-5">
          <div>
            <label className={LABEL}>Nome</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              maxLength={100}
              className={INPUT}
            />
          </div>
          <div>
            <label className={LABEL}>E-mail</label>
            <input value={profile?.email ?? ''} disabled className={`${INPUT} opacity-50 cursor-not-allowed`} />
            <p className="text-xs text-gray-400 mt-1.5">O e-mail não pode ser alterado.</p>
          </div>
          <div>
            <label className={LABEL}>Bairro</label>
            <input
              value={form.neighborhood}
              onChange={(e) => setForm((f) => ({ ...f, neighborhood: e.target.value }))}
              maxLength={100}
              placeholder="Ex: Centro"
              className={INPUT}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors mt-1"
          >
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>
      </div>
    </div>
  )
}
