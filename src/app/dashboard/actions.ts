'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createDocument(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const title = formData.get('title') as string || 'Unknown'

  const { data, error } = await supabase
    .from('documents')
    .insert([
      { title, owner_id: user.id }
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating document:', error)
    throw new Error('Failed to create document')
  }

  revalidatePath('/dashboard')
  redirect(`/document/${data.id}`)
}

export async function deleteDocument(formData: FormData) {
  const documentId = formData.get('id') as string

  if (!documentId) return

  const supabase = await createClient()

  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId)

  if (error) {
    console.error('Error deleting document:', error)
    throw new Error('Failed to delete document')
  }

  revalidatePath('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
