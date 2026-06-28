'use client'

import { useEffect, useRef, useCallback } from 'react'
import EditorJS, { OutputData } from '@editorjs/editorjs'
import Header from '@editorjs/header'
import List from '@editorjs/list'
import { createBrowserClient } from '@supabase/ssr'

interface EditorProps {
  documentId: string
  initialContent: OutputData | null
  title: string
  onTitleAutoUpdate: (newTitle: string) => void
  onSave: () => void
}

export default function Editor({ documentId, initialContent, title, onTitleAutoUpdate, onSave }: EditorProps) {
  const ejInstance = useRef<EditorJS | null>(null)
  
  // Use useCallback for the save function so it can be safely referenced
  const saveDocument = useCallback(async (data: OutputData) => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    await supabase
      .from('documents')
      .update({ content: data, updated_at: new Date().toISOString() })
      .eq('id', documentId)
  }, [documentId])

  useEffect(() => {
    if (ejInstance.current === null) {
      const editor = new EditorJS({
        holder: 'editorjs',
        data: initialContent || { blocks: [] },
        tools: {
          header: {
            class: Header,
            inlineToolbar: true,
            config: {
              placeholder: 'Enter a header',
              levels: [1, 2, 3, 4],
              defaultLevel: 2
            }
          },
          list: {
            class: List,
            inlineToolbar: true,
          }
        },
        onChange: async (api) => {
          const data = await api.saver.save()
          // Auto-save on change (in a real app, you might want to debounce this)
          saveDocument(data)
          onSave()

          // Auto-rename logic if the title is 'Unknown' or 'Untitled Document'
          if (title === 'Unknown' || title === 'Untitled Document') {
            if (data.blocks.length > 0) {
              const firstBlock = data.blocks[0]
              let textContent = ''
              if (firstBlock.type === 'paragraph' || firstBlock.type === 'header') {
                textContent = firstBlock.data.text || ''
              }
              // Strip HTML tags if any
              textContent = textContent.replace(/<[^>]*>?/gm, '')
              
              const words = textContent.trim().split(/\s+/)
              if (words.length > 0 && words[0] !== '') {
                // take first 3-4 words (let's say 4)
                const newTitle = words.slice(0, 4).join(' ')
                onTitleAutoUpdate(newTitle)
              }
            }
          }
        },
      })

      ejInstance.current = editor
    }

    return () => {
      if (ejInstance.current && typeof ejInstance.current.destroy === 'function') {
        ejInstance.current.destroy()
        ejInstance.current = null
      }
    }
  }, [initialContent, saveDocument])

  return (
    <div className="prose max-w-none mx-auto bg-white p-8 shadow-sm rounded-lg border border-gray-200 min-h-[500px]">
      <div id="editorjs" />
    </div>
  )
}
