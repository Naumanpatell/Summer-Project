import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold text-brand-700">Proptyze</h1>
      <p className="text-gray-500 text-lg">Property analysis powered by computer vision.</p>
      <Link
        to="/upload"
        className="px-6 py-3 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-600 transition-colors"
      >
        Analyse a property
      </Link>
    </div>
  )
}
