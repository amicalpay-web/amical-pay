import type {
  AuthChangeEvent,
  Session,
  Subscription,
  User,
} from '@supabase/supabase-js'
import { supabaseClient, type Profile } from '@/lib/supabaseClient'

export interface ServiceResult<T> {
  data: T | null
  error: string | null
}

export interface ProfileUpdate {
  displayName: string
}

type AuthData = {
  user: User | null
  session: Session | null
}

type ErrorLike = {
  message?: string
  code?: string
  status?: number
}

const notConfiguredMessage =
  'Le service de connexion n’est pas configuré. Contactez l’administrateur du site.'

function translateError(error: ErrorLike | null, fallback: string): string {
  if (!error) return fallback

  const message = error.message?.toLowerCase() || ''

  if (message.includes('invalid login credentials')) {
    return 'Adresse e-mail ou mot de passe incorrect.'
  }
  if (message.includes('user already registered')) {
    return 'Cette adresse e-mail est déjà utilisée.'
  }
  if (message.includes('email not confirmed')) {
    return 'Confirmez votre adresse e-mail avant de vous connecter.'
  }
  if (message.includes('password should be at least')) {
    return 'Le mot de passe doit contenir au moins six caractères.'
  }
  if (message.includes('unable to validate email')) {
    return 'Saisissez une adresse e-mail valide.'
  }
  if (message.includes('rate limit')) {
    return 'Trop de tentatives. Réessayez dans quelques instants.'
  }
  if (message.includes('session') && message.includes('missing')) {
    return 'Votre session a expiré. Connectez-vous à nouveau.'
  }
  if (error.status === 429) {
    return 'Trop de tentatives. Réessayez dans quelques instants.'
  }

  return fallback
}

function profileFromRow(row: Profile | null): Profile | null {
  if (!row) return null

  return {
    ...row,
    balance_htg: Number(row.balance_htg),
  }
}

function unavailable<T>(): ServiceResult<T> {
  return { data: null, error: notConfiguredMessage }
}

export const authService = {
  async signUp(email: string, password: string): Promise<ServiceResult<AuthData>> {
    if (!supabaseClient) return unavailable<AuthData>()

    const { data, error } = await supabaseClient.auth.signUp({ email, password })
    return {
      data: error ? null : data,
      error: error
        ? translateError(error, 'Impossible de créer le compte pour le moment.')
        : null,
    }
  },

  async signIn(email: string, password: string): Promise<ServiceResult<AuthData>> {
    if (!supabaseClient) return unavailable<AuthData>()

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password })
    return {
      data: error ? null : data,
      error: error
        ? translateError(error, 'Impossible de vous connecter pour le moment.')
        : null,
    }
  },

  async signOut(): Promise<ServiceResult<null>> {
    if (!supabaseClient) return unavailable<null>()

    const { error } = await supabaseClient.auth.signOut()
    return {
      data: error ? null : null,
      error: error ? translateError(error, 'Impossible de fermer la session.') : null,
    }
  },

  async getSession(): Promise<ServiceResult<Session>> {
    if (!supabaseClient) return unavailable<Session>()

    const { data, error } = await supabaseClient.auth.getSession()
    return {
      data: error ? null : data.session,
      error: error ? translateError(error, 'Impossible de récupérer votre session.') : null,
    }
  },

  async getCurrentUser(): Promise<ServiceResult<User>> {
    if (!supabaseClient) return unavailable<User>()

    const sessionResult = await this.getSession()
    if (sessionResult.error) return { data: null, error: sessionResult.error }
    if (!sessionResult.data?.user) return { data: null, error: null }

    return { data: sessionResult.data.user, error: null }
  },

  onAuthStateChange(
    callback: (event: AuthChangeEvent, session: Session | null) => void,
  ): ServiceResult<{ subscription: Subscription }> {
    if (!supabaseClient) return unavailable<{ subscription: Subscription }>()

    const { data } = supabaseClient.auth.onAuthStateChange(callback)
    return { data, error: null }
  },

  async requestPasswordReset(email: string): Promise<ServiceResult<null>> {
    if (!supabaseClient) return unavailable<null>()

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })
    return {
      data: error ? null : null,
      error: error
        ? translateError(error, 'Impossible d’envoyer le lien de réinitialisation.')
        : null,
    }
  },

  async updatePassword(password: string): Promise<ServiceResult<User>> {
    if (!supabaseClient) return unavailable<User>()

    const { data, error } = await supabaseClient.auth.updateUser({ password })
    return {
      data: error ? null : data.user,
      error: error
        ? translateError(error, 'Impossible de modifier le mot de passe.')
        : null,
    }
  },

  async getProfile(userId?: string): Promise<ServiceResult<Profile>> {
    if (!supabaseClient) return unavailable<Profile>()

    const currentUser = userId ? { data: { id: userId }, error: null } : await this.getCurrentUser()
    if (currentUser.error) return { data: null, error: currentUser.error }
    if (!currentUser.data) return { data: null, error: null }

    const { data, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', currentUser.data.id)
      .maybeSingle()

    return {
      data: error ? null : profileFromRow(data),
      error: error ? translateError(error, 'Impossible de récupérer votre profil.') : null,
    }
  },

  async updateProfile(updates: ProfileUpdate): Promise<ServiceResult<Profile>> {
    if (!supabaseClient) return unavailable<Profile>()

    const currentUser = await this.getCurrentUser()
    if (currentUser.error) return { data: null, error: currentUser.error }
    if (!currentUser.data) {
      return { data: null, error: 'Connectez-vous pour modifier votre profil.' }
    }

    const displayName = updates.displayName.trim()
    const { data, error } = await supabaseClient
      .from('profiles')
      .update({ display_name: displayName || null })
      .eq('id', currentUser.data.id)
      .select('*')
      .single()

    return {
      data: error ? null : profileFromRow(data),
      error: error ? translateError(error, 'Impossible de mettre à jour votre profil.') : null,
    }
  },

  async getAccessToken(): Promise<string | null> {
    const result = await this.getSession()
    return result.data?.access_token || null
  },
}