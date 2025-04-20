"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabaseClient } from "@/lib/supabase/client"
import type { Session, User } from "@supabase/supabase-js"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, name: string) => Promise<{ error: any; data: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const setData = async () => {
      const {
        data: { session },
        error,
      } = await supabaseClient.auth.getSession()
      if (error) {
        console.error(error)
        setIsLoading(false)
        return
      }
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    }

    const { data: authListener } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    setData()

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    })

    return { error }
  }

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })

    // If signup is successful, create a user record in our users table
    if (data.user && !error) {
      const { error: profileError } = await supabaseClient.from("users").insert([
        {
          auth_id: data.user.id,
          name,
          email,
        },
      ])

      if (profileError) {
        console.error("Error creating user profile:", profileError)
      }
    }

    return { data, error }
  }

  const signOut = async () => {
    await supabaseClient.auth.signOut()
  }

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
