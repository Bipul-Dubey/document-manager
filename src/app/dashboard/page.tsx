import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, LogOut } from 'lucide-react'
import { createDocument, logout, deleteDocument } from './actions'
import DeleteDocumentButton from '@/components/DeleteDocumentButton'
import AppLogo from '@/components/AppLogo'
import { FileText } from 'lucide-react'

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

  // Extract user's name from metadata, fallback to email or 'User'
  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'User'

  return (
    <div className="min-h-screen bg-[#FFF0E4] selection:bg-[#24B1B1]/30 font-sans">
      <header className="bg-white/40 backdrop-blur-md border-b border-[#007979]/10 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-br from-[#007979] to-[#24B1B1] rounded-xl shadow-sm">
              <AppLogo className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-[#007979] tracking-tight">
              Hello, {userName}
            </h1>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-[#007979]/20 text-sm font-semibold rounded-xl text-[#007979] bg-white/50 hover:bg-[#FFE0C5]/50 hover:border-[#007979]/40 transition-all shadow-sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </button>
          </form>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold text-[#007979]/80">Recent Documents</h2>
              <form action={createDocument} className="flex gap-2">
                <button
                  type="submit"
                  className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-[#007979] to-[#24B1B1] hover:from-[#006060] hover:to-[#1a9090] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#FFF0E4] focus:ring-[#24B1B1] shadow-lg shadow-[#24B1B1]/20 transition-all transform hover:scale-[1.02]"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  New Document
                </button>
              </form>
            </div>

            {documents && documents.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="group bg-white/60 backdrop-blur-sm border border-[#007979]/10 overflow-hidden shadow-sm hover:shadow-md hover:shadow-[#007979]/10 hover:border-[#007979]/30 rounded-2xl transition-all duration-200 ease-in-out relative flex flex-col transform hover:-translate-y-1">
                    <Link href={`/document/${doc.id}`} className="flex-1 p-5 flex flex-col justify-between">
                      <div className="flex items-start pr-8">
                        <div className="flex-shrink-0 mt-0.5">
                          <FileText className="h-5 w-5 text-[#24B1B1]" />
                        </div>
                        <div className="ml-3 w-0 flex-1">
                          <h3 className="text-base font-bold text-[#007979] truncate group-hover:text-[#005050] transition-colors">
                            {doc.title}
                          </h3>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <p className="text-xs font-medium text-[#007979]/60">
                          {new Date(doc.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </Link>
                    <form action={deleteDocument} className="absolute top-3 right-3 z-10">
                      <input type="hidden" name="id" value={doc.id} />
                      <DeleteDocumentButton />
                    </form>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white/40 backdrop-blur-sm rounded-3xl border-2 border-dashed border-[#007979]/20 shadow-sm">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FFE0C5] mb-4">
                  <FileText className="h-8 w-8 text-[#007979]" />
                </div>
                <h3 className="text-lg font-bold text-[#007979]">No documents yet</h3>
                <p className="mt-2 text-sm text-[#007979]/70 max-w-sm mx-auto">
                  Create your first document to start exploring the local-first collaborative experience.
                </p>
                <div className="mt-6">
                  <form action={createDocument}>
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-[#007979]/20 text-sm font-semibold rounded-xl text-[#007979] bg-white hover:bg-[#FFE0C5]/50 transition-all shadow-sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create one now
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
