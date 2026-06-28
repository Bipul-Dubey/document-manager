'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, Edit2, History } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import EditorWrapper from './EditorWrapper'
import { OutputData } from '@editorjs/editorjs'
import VersionHistory from './VersionHistory'

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
  
  // Versioning state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [editorContent, setEditorContent] = useState(initialContent)
  const [editorKey, setEditorKey] = useState(0) // Used to force remount of EditorJS
  const [previewVersion, setPreviewVersion] = useState<any | null>(null)
  const [prePreviewContent, setPrePreviewContent] = useState<OutputData | null>(null)

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

  const handleRestore = async (versionContent: OutputData) => {
    // 1. Update local state
    setEditorContent(versionContent)
    setEditorKey(prev => prev + 1) // Force complete remount of EditorJS
    const now = new Date()
    setLastUpdated(now)

    // 2. Save the restored content as the current document state
    await supabase
      .from('documents')
      .update({ content: versionContent, updated_at: now.toISOString() })
      .eq('id', documentId)
  }

  const handlePreview = (version: any) => {
    setPrePreviewContent(editorContent)
    setPreviewVersion(version)
    setEditorContent(version.content)
    setEditorKey(prev => prev + 1)
  }

  const cancelPreview = () => {
    setEditorContent(prePreviewContent)
    setPreviewVersion(null)
    setEditorKey(prev => prev + 1)
  }

  const confirmPreviewRestore = () => {
    handleRestore(previewVersion.content)
    setPreviewVersion(null)
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF0E4] selection:bg-[#24B1B1]/30 font-sans overflow-x-hidden relative">
      <header className="bg-white/40 backdrop-blur-md border-b border-[#007979]/10 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/dashboard"
              className="text-[#007979]/70 hover:text-[#007979] bg-white/50 hover:bg-white/80 p-2 rounded-xl transition-all shadow-sm"
              title="Back to Dashboard"
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
                  className="px-3 py-1.5 bg-white/80 border border-[#24B1B1]/40 rounded-lg text-lg font-bold text-[#007979] focus:outline-none focus:ring-2 focus:ring-[#24B1B1] shadow-inner"
                />
              </form>
            ) : (
              <div 
                className="flex items-center space-x-2 cursor-pointer group px-2 py-1 -ml-2 rounded-lg hover:bg-white/40 transition-colors"
                onClick={() => setIsEditingTitle(true)}
              >
                <h1 className="text-lg font-bold text-[#007979] truncate max-w-sm sm:max-w-md">
                  {title}
                </h1>
                <Edit2 className="h-4 w-4 text-[#007979]/40 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-xs font-medium text-[#007979]/60 flex items-center bg-white/50 px-3 py-1.5 rounded-full shadow-sm">
              <span suppressHydrationWarning>
                Last updated: {lastUpdated.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            </div>
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center space-x-1.5 text-xs font-bold text-[#007979] bg-[#24B1B1]/10 hover:bg-[#24B1B1]/20 px-3 py-1.5 rounded-full transition-colors border border-[#24B1B1]/30"
              title="View Version History"
            >
              <History className="h-4 w-4" />
              <span>History</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {previewVersion && (
          <div className="mb-4 bg-[#007979] text-white rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-[#007979]/20 animate-in slide-in-from-top-4">
            <div className="flex items-center space-x-3">
              <History className="h-5 w-5 text-[#24B1B1]" />
              <div>
                <h3 className="font-bold">Previewing Past Version</h3>
                <p className="text-sm text-white/80">
                  {new Date(previewVersion.created_at).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={cancelPreview}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmPreviewRestore}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-[#24B1B1] hover:bg-[#1a9090] transition-colors shadow-sm"
              >
                Restore This Version
              </button>
            </div>
          </div>
        )}

        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl shadow-[#007979]/5 border border-white p-6 sm:p-8 min-h-[70vh]">
          <EditorWrapper 
            key={editorKey}
            documentId={documentId} 
            initialContent={editorContent}
            title={title}
            onTitleAutoUpdate={updateTitle}
            onSave={() => setLastUpdated(new Date())}
            isPreviewMode={!!previewVersion}
          />
        </div>
      </main>

      <VersionHistory 
        documentId={documentId} 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        onRestore={handleRestore} 
        onPreview={handlePreview}
      />
    </div>
  )
}
