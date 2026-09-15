import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Card, Input } from '@/components'
import { SeoHead } from '@/components/SeoHead'
import { useAuth } from '@/contexts/AuthContext'

type AuthMode = 'login' | 'signup'

function Auth() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const { signIn, signUp, requestPasswordReset } = useAuth()
  const mode: AuthMode = location.pathname === '/signup' ? 'signup' : 'login'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [forgotPassword, setForgotPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setForgotPassword(false)
    setMessage('')
    setError('')
  }, [mode])

  const switchMode = (nextMode: AuthMode) => {
    navigate(nextMode === 'signup' ? '/signup' : '/login')
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    if (forgotPassword) {
      const result = await requestPasswordReset(email)
      setLoading(false)
      if (result.error) setError(result.error)
      else setMessage(t('auth.messages.passwordResetSent'))
      return
    }

    if (mode === 'signup' && password !== passwordConfirmation) {
      setLoading(false)
      setError(t('auth.errors.passwordMismatch'))
      return
    }

    const result = mode === 'login'
      ? await signIn(email, password)
      : await signUp(email, password)

    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }

    if (mode === 'login') {
      setMessage(t('auth.messages.loginSuccess'))
      navigate('/account')
    } else if (result.data?.session) {
      setMessage(t('auth.messages.signupSuccess'))
      navigate('/account')
    } else {
      setMessage(t('auth.messages.confirmEmail'))
    }
  }

  return (
    <main className="min-h-[calc(100vh-4.5rem)] bg-amical-dark px-4 py-12">
      <SeoHead
        title={mode === 'signup' ? 'Créer un compte' : 'Connexion'}
        path={mode === 'signup' ? '/signup' : '/login'}
        noindex
      />

      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-amical-orange">
            {t('auth.eyebrow')}
          </p>
          <h1 className="text-3xl font-bold text-white">{t('auth.title')}</h1>
          <p className="mt-3 text-gray-400">{t('auth.subtitle')}</p>
        </div>

        <Card>
          <div className="mb-6 grid grid-cols-2 gap-2 rounded-lg bg-amical-dark-tertiary p-1">
            <Button
              type="button"
              size="sm"
              variant={mode === 'login' ? 'primary' : 'ghost'}
              onClick={() => switchMode('login')}
            >
              {t('auth.loginTab')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mode === 'signup' ? 'primary' : 'ghost'}
              onClick={() => switchMode('signup')}
            >
              {t('auth.signupTab')}
            </Button>
          </div>

          <form className="space-y-4" onSubmit={submit}>
            <Input
              required
              autoComplete="email"
              type="email"
              label={t('auth.email')}
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            {!forgotPassword && (
              <Input
                required
                minLength={6}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                type="password"
                label={t('auth.password')}
                placeholder={t('auth.passwordPlaceholder')}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            )}

            {mode === 'signup' && !forgotPassword && (
              <Input
                required
                minLength={6}
                autoComplete="new-password"
                type="password"
                label={t('auth.confirmPassword')}
                placeholder={t('auth.passwordPlaceholder')}
                value={passwordConfirmation}
                onChange={(event) => setPasswordConfirmation(event.target.value)}
              />
            )}

            {error && <p className="text-sm text-red-300" role="alert">{error}</p>}
            {message && <p className="text-sm text-green-300" role="status">{message}</p>}

            <Button className="w-full" type="submit" isLoading={loading} loadingText={t('common.loading')}>
              {forgotPassword ? t('auth.sendResetLink') : mode === 'login' ? t('auth.loginButton') : t('auth.signupButton')}
            </Button>
          </form>

          {mode === 'login' && (
            <button
              type="button"
              className="mt-5 w-full text-center text-sm text-gray-400 transition hover:text-amical-orange"
              onClick={() => {
                setForgotPassword((value) => !value)
                setError('')
                setMessage('')
              }}
            >
              {forgotPassword ? t('auth.backToLogin') : t('auth.forgotPassword')}
            </button>
          )}
        </Card>

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link className="transition hover:text-amical-orange" to="/">
            {t('auth.backToHome')}
          </Link>
        </p>
      </div>
    </main>
  )
}

export default Auth
