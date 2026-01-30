'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CsvImport } from '@/components/admin/CsvImport'
import { ManualForm } from '@/components/admin/ManualForm'
import { TodoImages } from '@/components/admin/TodoImages'
import { TodoDescriptions } from '@/components/admin/TodoDescriptions'

export default function AdminPage() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'import' | 'manual' | 'todo'>('import')
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push('/login')
      } else {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Administration</h1>
            <p className="text-sm text-gray-500">Gestion des représentations</p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Voir le site
            </a>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('import')}
                className={`px-6 py-3 text-sm font-medium border-b-2 -mb-px ${
                  activeTab === 'import'
                    ? 'border-amber-600 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Import CSV
              </button>
              <button
                onClick={() => setActiveTab('manual')}
                className={`px-6 py-3 text-sm font-medium border-b-2 -mb-px ${
                  activeTab === 'manual'
                    ? 'border-amber-600 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Saisie manuelle
              </button>
              <button
                onClick={() => setActiveTab('todo')}
                className={`px-6 py-3 text-sm font-medium border-b-2 -mb-px ${
                  activeTab === 'todo'
                    ? 'border-amber-600 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                À compléter
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'import' && <CsvImport />}
            {activeTab === 'manual' && <ManualForm />}
            {activeTab === 'todo' && (
              <div className="space-y-8">
                <TodoImages />
                <div className="border-t border-gray-200 pt-6">
                  <TodoDescriptions />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
