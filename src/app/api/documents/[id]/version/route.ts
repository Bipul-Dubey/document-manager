import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { content } = body

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Insert new version
    const { data, error } = await supabase
      .from('document_versions')
      .insert({
        document_id: id,
        content,
        created_by: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving document version:', error)
      return NextResponse.json({ error: 'Failed to save version' }, { status: 500 })
    }

    return NextResponse.json({ success: true, version: data })
  } catch (err) {
    console.error('Unexpected error saving version:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
