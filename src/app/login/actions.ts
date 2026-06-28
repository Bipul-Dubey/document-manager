'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        name: formData.get('name') as string,
      }
    }
  }

  const { data: signUpData, error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message) + '&mode=signup')
  }

  // Supabase returns an empty identities array if the user already exists (when email enumeration protection is on)
  if (signUpData.user && signUpData.user.identities && signUpData.user.identities.length === 0) {
    redirect('/login?error=' + encodeURIComponent('An account is already registered with this email address. Please sign in instead.') + '&mode=signup')
  }

  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard')
}
