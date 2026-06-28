'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, Edit2 } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import EditorWrapper from './EditorWrapper'
import { OutputData } from '@editorjs/editorjs'

interface DocumentWorkspaceProps {
  documentId: string
  initialTitle: string
  initialContent: OutputData | null
  updatedAt: string
}

export default function DocumentWorkspace({
  documentId,
  initialTitle,
  initialContent,
  updatedAt,
}: DocumentWorkspaceProps) {
  const [title, setTitle] = useState(initialTitle)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [tempTitle, setTempTitle] = useState(title)
  const [lastUpdated, setLastUpdated] = useState(new Date(updatedAt))

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const updateTitle = async (newTitle: string) => {
    if (!newTitle.trim()) newTitle = 'Unknown'
    setTitle(newTitle)
    setTempTitle(newTitle)
    setIsEditingTitle(false)
    const now = new Date()
    setLastUpdated(now)

    await supabase
      .from('documents')
      .update({ title: newTitle, updated_at: now.toISOString() })
      .eq('id', documentId)
  }

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateTitle(tempTitle)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/dashboard"
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            
            {isEditingTitle ? (
              <form onSubmit={handleTitleSubmit} className="flex items-center">
                <input
                  type="text"
                  autoFocus
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onBlur={() => updateTitle(tempTitle)}
                  className="px-2 py-1 border border-blue-500 rounded text-lg font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </form>
            ) : (
              <div 
                className="flex items-center space-x-2 cursor-pointer group"
                onClick={() => setIsEditingTitle(true)}
              >
                <h1 className="text-lg font-semibold text-gray-800 border-b border-transparent group-hover:border-gray-300">
                  {title}
                </h1>
                <Edit2 className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>
          <div className="text-xs text-gray-500 flex items-center">
            {/* Could show saving state here */}
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <EditorWrapper 
          documentId={documentId} 
          initialContent={initialContent}
          title={title}
          onTitleAutoUpdate={updateTitle}
          onSave={() => setLastUpdated(new Date())}
        />
      </main>
    </div>
  )
}
