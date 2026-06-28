import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import DocumentWorkspace from '@/components/DocumentWorkspace'

export default async function DocumentPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }
  
  const { id } = await params

  const { data: document, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !document) {
    console.error('Error fetching document:', error)
    notFound()
  }

  return (
    <DocumentWorkspace 
      documentId={document.id} 
      initialTitle={document.title}
      initialContent={document.content || { blocks: [] }}
      updatedAt={document.updated_at}
    />
  )
}
