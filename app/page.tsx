import { SearchInterface } from '@/components/SearchInterface'

// Build stamp to confirm the server is serving the latest built assets.
// (This is evaluated at build time for static pages.)
const BUILD_STAMP = new Date().toISOString()

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
        <div className="max-w-4xl mx-auto px-4 py-6 text-center space-y-2">
          <div className="text-xs text-gray-400 tracking-wide">
            Mise à jour hebdomadaire
          </div>
          <div className="text-[10px] text-gray-300 tracking-wide">
            build: {BUILD_STAMP}
          </div>
        </div>
      </footer>
    </main>
  )
}
