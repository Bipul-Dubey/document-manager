'use client'

import dynamic from 'next/dynamic'
import { OutputData } from '@editorjs/editorjs'

const TipTapEditor = dynamic(() => import('./TipTapEditor'), {
  ssr: false,
  loading: () => <div className="text-center p-12 text-[#007979]/50 font-medium">Loading editor...</div>
})

interface EditorWrapperProps {
  documentId: string
  initialContent: any
  title: string
  onTitleAutoUpdate: (newTitle: string) => void
  onSave: () => void
  isPreviewMode?: boolean
}

export default function EditorWrapper(props: EditorWrapperProps) {
  return <TipTapEditor {...props} />
}
