'use client'

import { Trash2 } from 'lucide-react'

export default function DeleteDocumentButton() {
  return (
    <button 
      type="submit" 
      className="text-gray-400 hover:text-red-500 transition-colors p-2 -m-2 rounded-full hover:bg-red-50"
      title="Delete Document"
      onClick={(e) => {
        if (!window.confirm('Are you sure you want to delete this document?')) {
          e.preventDefault()
        }
      }}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}
