import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button, Card } from '@/components'
import { Input } from '@/components'
import { authService } from '@/services'
import { useEffect, useState } from 'react'

function Account() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    authService.isAuthenticated().then(setAuthenticated)
  }, [])

  const submit = async () => {
    setError('')
    setMessage('')
    try {
      if (mode === 'login') {
        await authService.login(email, password)
        setAuthenticated(true)
        setMessage('Connexion réussie.')
      } else {
        const result = await authService.signup(email, password)
        setMessage(result.session ? 'Compte créé et connecté.' : 'Compte créé. Vérifiez votre adresse e-mail.')
        setAuthenticated(Boolean(result.session))
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Une erreur est survenue.')
    }
  }

  return (
    <div className="min-h-screen bg-amical-dark py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">{t('account.title')}</h1>

        <Card>
          {authenticated ? (
            <>
              <p className="text-gray-300 mb-6">Vous êtes connecté avec votre compte Supabase.</p>
              <Button className="w-full" onClick={() => navigate('/track-order')}>
                Voir mes commandes
              </Button>
            </>
          ) : (
            <>
              <div className="flex gap-2 mb-6">
                <Button variant={mode === 'login' ? 'primary' : 'ghost'} onClick={() => setMode('login')}>
                  Connexion
                </Button>
                <Button variant={mode === 'signup' ? 'primary' : 'ghost'} onClick={() => setMode('signup')}>
                  Créer un compte
                </Button>
              </div>
              <div className="space-y-4">
                <Input type="email" placeholder="E-mail" value={email} onChange={(event) => setEmail(event.target.value)} />
                <Input type="password" placeholder="Mot de passe" value={password} onChange={(event) => setPassword(event.target.value)} />
                {error && <p className="text-sm text-red-300" role="alert">{error}</p>}
                {message && <p className="text-sm text-green-300" role="status">{message}</p>}
                <Button className="w-full" onClick={submit}>
                  {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}

export default Account
