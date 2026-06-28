'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { X, Clock, RotateCcw, FileText } from 'lucide-react'
import type { OutputData } from '@editorjs/editorjs'

interface Version {
  id: string
  created_at: string
  content: OutputData
}

interface VersionHistoryProps {
  documentId: string
  isOpen: boolean
  onClose: () => void
  onRestore: (content: OutputData) => void
  onPreview: (version: Version) => void
}

export default function VersionHistory({ documentId, isOpen, onClose, onRestore, onPreview }: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (!isOpen) return

    const fetchVersions = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching versions:', error)
      } else {
        setVersions(data || [])
      }
      setLoading(false)
    }

    fetchVersions()
  }, [isOpen, documentId, supabase])

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-[#FFF0E4] shadow-2xl border-l border-[#007979]/20 z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
      <div className="flex items-center justify-between p-4 border-b border-[#007979]/10 bg-white/40 backdrop-blur-md">
        <div className="flex items-center space-x-2 text-[#007979]">
          <Clock className="h-5 w-5" />
          <h2 className="text-lg font-bold">Version History</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-[#007979]/60 hover:text-[#007979] hover:bg-white/50 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center text-[#007979]/60 py-8">
            <div className="animate-pulse flex flex-col items-center">
              <Clock className="h-8 w-8 mb-2 opacity-50" />
              <p>Loading versions...</p>
            </div>
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center text-[#007979]/60 py-8 bg-white/40 rounded-xl border border-dashed border-[#007979]/20">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No saved versions yet.</p>
            <p className="text-xs mt-1 opacity-70">Versions are saved automatically when you leave the document.</p>
          </div>
        ) : (
          versions.map((version, index) => (
            <div
              key={version.id}
              className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-[#007979]/10 shadow-sm hover:shadow-md hover:border-[#24B1B1]/40 transition-all group flex flex-col"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm font-bold text-[#007979]">
                    {index === 0 ? 'Latest Snapshot' : `Version ${versions.length - index}`}
                  </p>
                  <p className="text-xs text-[#007979]/70 mt-0.5">
                    {new Date(version.created_at).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <button
                  onClick={() => {
                    onPreview(version)
                    onClose()
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-1.5 px-3 bg-white border border-[#007979]/30 text-[#007979] text-sm font-semibold rounded-lg hover:bg-[#007979]/5 transition-all"
                >
                  <FileText className="h-4 w-4" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to restore this version? Your current unsaved changes will be lost.')) {
                      onRestore(version.content)
                      onClose()
                    }
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-1.5 px-3 bg-white border border-[#24B1B1]/30 text-[#007979] text-sm font-semibold rounded-lg hover:bg-gradient-to-r hover:from-[#007979] hover:to-[#24B1B1] hover:text-white hover:border-transparent transition-all"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Restore</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
