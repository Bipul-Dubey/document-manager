'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import { Highlight } from '@tiptap/extension-highlight'
import { createBrowserClient } from '@supabase/ssr'
import EditorToolbar from './EditorToolbar'

interface TipTapEditorProps {
  documentId: string
  initialContent: any
  title: string
  onTitleAutoUpdate: (newTitle: string) => void
  onSave: () => void
  isPreviewMode?: boolean
}

// Simple migration for old Editor.js blocks to HTML
function convertEditorJsToHtml(content: any): string | null {
  if (!content || !content.blocks || !Array.isArray(content.blocks)) {
    return null
  }
  return content.blocks
    .map((block: any) => {
      if (block.type === 'paragraph') return `<p>${block.data.text}</p>`
      if (block.type === 'header') return `<h${block.data.level}>${block.data.text}</h${block.data.level}>`
      if (block.type === 'list') {
        const tag = block.data.style === 'ordered' ? 'ol' : 'ul'
        const items = block.data.items.map((i: string) => `<li>${i}</li>`).join('')
        return `<${tag}>${items}</${tag}>`
      }
      return ''
    })
    .join('')
}

export default function TipTapEditor({
  documentId,
  initialContent,
  title,
  onTitleAutoUpdate,
  onSave,
  isPreviewMode = false,
}: TipTapEditorProps) {
  const hasUnsavedEdits = useRef<boolean>(false)
  const currentContent = useRef<any>(null)

  // Use useCallback for the save function so it can be safely referenced
  const saveDocument = useCallback(
    async (data: any) => {
      if (isPreviewMode) return
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      await supabase
        .from('documents')
        .update({ content: data, updated_at: new Date().toISOString() })
        .eq('id', documentId)
    },
    [documentId, isPreviewMode]
  )

  // Save a discrete version snapshot
  const saveVersion = useCallback(() => {
    if (isPreviewMode) return
    if (hasUnsavedEdits.current && currentContent.current) {
      fetch(`/api/documents/${documentId}/version`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: currentContent.current }),
        keepalive: true,
      }).catch(console.error)

      hasUnsavedEdits.current = false
    }
  }, [documentId, isPreviewMode])

  const latestProps = useRef({ title, onTitleAutoUpdate, onSave, saveVersion })
  useEffect(() => {
    latestProps.current = { title, onTitleAutoUpdate, onSave, saveVersion }
  }, [title, onTitleAutoUpdate, onSave, saveVersion])

  // Determine starting content
  let startingData = initialContent
  const migratedHtml = convertEditorJsToHtml(initialContent)
  if (migratedHtml !== null) {
    startingData = migratedHtml
  } else if (!startingData || (typeof startingData === 'object' && Object.keys(startingData).length === 0)) {
    startingData = '' // Empty string for Tiptap
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
    ],
    content: startingData,
    editable: !isPreviewMode,
    autofocus: !isPreviewMode ? 'end' : false,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[400px] w-full max-w-none text-[#007979] prose-headings:text-[#007979] prose-a:text-[#24B1B1] prose-p:my-2 prose-p:leading-snug',
      },
    },
    onUpdate: ({ editor }) => {
      if (isPreviewMode) return
      const json = editor.getJSON()
      const text = editor.getText()

      hasUnsavedEdits.current = true
      currentContent.current = json

      saveDocument(json)
      latestProps.current.onSave()

      // Auto-rename logic
      if (
        latestProps.current.title === 'Unknown' ||
        latestProps.current.title === 'Untitled Document'
      ) {
        if (text.trim().length > 0) {
          const words = text.trim().split(/\s+/)
          if (words.length > 0 && words[0] !== '') {
            const newTitle = words.slice(0, 4).join(' ')
            latestProps.current.onTitleAutoUpdate(newTitle)
          }
        }
      }
    },
  })

  useEffect(() => {
    if (editor) {
      editor.setEditable(!isPreviewMode)
    }
  }, [isPreviewMode, editor])

  useEffect(() => {
    const handleBeforeUnload = () => {
      latestProps.current.saveVersion()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      latestProps.current.saveVersion()
    }
  }, [])

  return (
    <div className={`relative ${isPreviewMode ? 'opacity-80' : ''}`}>
      {!isPreviewMode && <EditorToolbar editor={editor} />}
      <div className="p-4 sm:p-8">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
