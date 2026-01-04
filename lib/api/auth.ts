import { createClient } from '../supabase/client'

const supabase = createClient()

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}

/**
 * Sign out current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }

  return true
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  return user
}

/**
 * Get current session
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    throw error
  }

  return session
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const session = await getSession()
  return !!session
}
