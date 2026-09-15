import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Input } from '@/components'
import { useAuth } from '@/contexts/AuthContext'

function Account() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const {
    user,
    profile,
    loading,
    updateProfile,
    updatePassword,
    signOut,
  } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [profileMessage, setProfileMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [error, setError] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    setDisplayName(profile?.display_name || '')
  }, [profile?.display_name])

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-4.5rem)] bg-amical-dark px-4 py-12">
        <div className="mx-auto max-w-2xl text-center text-gray-400">{t('common.loading')}</div>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="min-h-[calc(100vh-4.5rem)] bg-amical-dark px-4 py-12">
        <div className="mx-auto max-w-md">
          <Card>
            <h1 className="text-2xl font-bold text-white">{t('account.title')}</h1>
            <p className="mt-3 text-gray-400">{t('account.loginRequired')}</p>
            <Button className="mt-6 w-full" onClick={() => navigate('/login')}>
              {t('auth.loginButton')}
            </Button>
          </Card>
        </div>
      </main>
    )
  }

  const formattedBalance = new Intl.NumberFormat(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
    maximumFractionDigits: 2,
  }).format(Number(profile?.balance_htg || 0))

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setProfileMessage('')
    setError('')
    setSavingProfile(true)
    const result = await updateProfile({ displayName })
    setSavingProfile(false)
    if (result.error) setError(result.error)
    else setProfileMessage(t('account.profileSaved'))
  }

  const savePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPasswordMessage('')
    setError('')
    setSavingPassword(true)
    const result = await updatePassword(newPassword)
    setSavingPassword(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setNewPassword('')
    setPasswordMessage(t('account.passwordSaved'))
  }

  const logout = async () => {
    const result = await signOut()
    if (result.error) {
      setError(result.error)
      return
    }
    navigate('/')
  }

  return (
    <main className="min-h-[calc(100vh-4.5rem)] bg-amical-dark px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-amical-orange">
              {t('account.profile')}
            </p>
            <h1 className="text-3xl font-bold text-white">{t('account.title')}</h1>
            <p className="mt-2 text-gray-400">{user.email}</p>
          </div>
          <Button variant="ghost" onClick={logout}>{t('account.logout')}</Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <p className="text-sm text-gray-400">{t('account.balance')}</p>
            <p className="mt-2 text-4xl font-bold text-white">
              {formattedBalance} <span className="text-lg text-amical-orange">HTG</span>
            </p>
            <p className="mt-3 text-sm text-gray-500">{t('account.balanceDescription')}</p>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-white">{t('account.profile')}</h2>
            <form className="mt-5 space-y-4" onSubmit={saveProfile}>
              <Input
                label={t('account.displayName')}
                placeholder={t('account.displayNamePlaceholder')}
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
              />
              <Button type="submit" isLoading={savingProfile} loadingText={t('common.loading')}>
                {t('account.saveProfile')}
              </Button>
              {profileMessage && <p className="text-sm text-green-300" role="status">{profileMessage}</p>}
            </form>
          </Card>
        </div>

        <Card className="mt-6">
          <h2 className="text-xl font-semibold text-white">{t('account.changePassword')}</h2>
          <form className="mt-5 max-w-md space-y-4" onSubmit={savePassword}>
            <Input
              required
              minLength={6}
              type="password"
              autoComplete="new-password"
              label={t('account.newPassword')}
              placeholder={t('auth.passwordPlaceholder')}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
            <Button type="submit" isLoading={savingPassword} loadingText={t('common.loading')}>
              {t('account.savePassword')}
            </Button>
            {passwordMessage && <p className="text-sm text-green-300" role="status">{passwordMessage}</p>}
          </form>
        </Card>

        {error && <p className="mt-6 text-sm text-red-300" role="alert">{error}</p>}
      </div>
    </main>
  )
}

export default Account