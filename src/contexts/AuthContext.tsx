/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { authService, type ProfileUpdate } from '@/services/authService'
import type { Profile } from '@/lib/supabaseClient'
import type { ServiceResult } from '@/services/authService'

interface AuthContextValue {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signUp: typeof authService.signUp
  signIn: typeof authService.signIn
  signOut: typeof authService.signOut
  getSession: typeof authService.getSession
  getCurrentUser: typeof authService.getCurrentUser
  getProfile: typeof authService.getProfile
  requestPasswordReset: typeof authService.requestPasswordReset
  updatePassword: typeof authService.updatePassword
  updateProfile: (updates: ProfileUpdate) => Promise<ServiceResult<Profile>>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadProfile = async (userId: string) => {
      const result = await authService.getProfile(userId)
      if (mounted && !result.error) setProfile(result.data)
    }

    const initialize = async () => {
      const sessionResult = await authService.getSession()
      if (!mounted) return

      setSession(sessionResult.data)
      setUser(sessionResult.data?.user || null)

      if (sessionResult.data?.user) {
        await loadProfile(sessionResult.data.user.id)
      }

      if (mounted) setLoading(false)
    }

    const subscriptionResult = authService.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return

      setSession(nextSession)
      setUser(nextSession?.user || null)
      if (nextSession?.user) {
        void loadProfile(nextSession.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    void initialize()

    return () => {
      mounted = false
      subscriptionResult.data?.subscription.unsubscribe()
    }
  }, [])

  const updateProfile = async (updates: ProfileUpdate) => {
    const result = await authService.updateProfile(updates)
    if (!result.error && result.data) setProfile(result.data)
    return result
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signUp: authService.signUp,
        signIn: authService.signIn,
        signOut: authService.signOut,
        getSession: authService.getSession,
        getCurrentUser: authService.getCurrentUser,
        getProfile: authService.getProfile,
        requestPasswordReset: authService.requestPasswordReset,
        updatePassword: authService.updatePassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}