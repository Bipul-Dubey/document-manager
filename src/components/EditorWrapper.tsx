'use client'

import dynamic from 'next/dynamic'
import type { OutputData } from '@editorjs/editorjs'

const Editor = dynamic(() => import('./Editor'), {
  ssr: false,
  loading: () => <div className="text-center p-12 text-gray-500">Loading editor...</div>
})

interface EditorWrapperProps {
  documentId: string
  initialContent: OutputData | null
  title: string
  onTitleAutoUpdate: (newTitle: string) => void
  onSave: () => void
}

export default function EditorWrapper(props: EditorWrapperProps) {
  return <Editor {...props} />
}
