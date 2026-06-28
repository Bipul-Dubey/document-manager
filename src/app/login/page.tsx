import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import AuthForm from '@/components/AuthForm'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string, mode?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  const awaitedSearchParams = await searchParams;
  const errorMessage = awaitedSearchParams?.error;
  const mode = awaitedSearchParams?.mode === 'signup' ? 'signup' : 'login';

  return <AuthForm errorMessage={errorMessage} initialMode={mode} />
}
