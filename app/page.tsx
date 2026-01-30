import { SearchInterface } from '@/components/SearchInterface'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-black">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-5xl font-normal tracking-tight text-black" style={{ fontFamily: 'var(--font-heading)' }}>
            Au théâtre ce soir
          </h1>
          <p className="mt-2 text-sm text-gray-600 tracking-wide uppercase">
            Région Bruxelles-Capitale
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <SearchInterface />
      </div>

      <footer className="border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <span className="text-xs text-gray-400 tracking-wide">
            Mise à jour hebdomadaire
          </span>
        </div>
      </footer>
    </main>
  )
}
