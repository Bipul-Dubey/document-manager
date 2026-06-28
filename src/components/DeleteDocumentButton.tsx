'use client'

import { Trash2 } from 'lucide-react'

export default function DeleteDocumentButton() {
  return (
    <button 
      type="submit" 
      className="text-[#007979]/40 hover:text-red-500 transition-colors p-2 -m-2 rounded-full hover:bg-red-50 focus:outline-none"
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
