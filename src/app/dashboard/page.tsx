import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, Plus, LogOut } from 'lucide-react'
import { createDocument, logout, deleteDocument } from './actions'
import DeleteDocumentButton from '@/components/DeleteDocumentButton'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .order('updated_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Your Documents</h1>
          <form action={logout}>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </button>
          </form>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-end mb-6">
              <form action={createDocument} className="flex gap-2">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  New Document
                </button>
              </form>
            </div>

            {documents && documents.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200 ease-in-out relative">
                    <Link href={`/document/${doc.id}`} className="block p-5 h-full">
                      <div className="flex items-center pr-8">
                        <div className="flex-shrink-0">
                          <FileText className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              {doc.title}
                            </dt>
                            <dd className="mt-1 text-xs text-gray-400">
                              Last updated: {new Date(doc.updated_at).toLocaleDateString()}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </Link>
                    <form action={deleteDocument} className="absolute top-4 right-4 z-10">
                      <input type="hidden" name="id" value={doc.id} />
                      <DeleteDocumentButton />
                    </form>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new document.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
