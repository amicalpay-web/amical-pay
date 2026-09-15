import { useNavigate } from 'react-router-dom'
import { Home as HomeIcon, Search } from 'lucide-react'
import { Button } from '@/components/Button'
import { SeoHead } from '@/components/SeoHead'

export function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-amical-dark px-4 py-20 text-center">
      <SeoHead title="Page introuvable" path="/404" noindex />

      <p className="text-6xl font-black text-amical-orange">404</p>
      <h1 className="mt-4 text-2xl font-bold text-white">Page introuvable</h1>
      <p className="mt-2 max-w-md text-sm text-gray-400">
        Cette page n'existe pas ou a été déplacée. Vérifiez l'adresse ou repartez depuis l'accueil.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={() => navigate('/')}>
          <span className="flex items-center gap-2">
            <HomeIcon size={18} />
            Retour à l'accueil
          </span>
        </Button>
        <Button variant="secondary" onClick={() => navigate('/products')}>
          <span className="flex items-center gap-2">
            <Search size={18} />
            Voir les produits
          </span>
        </Button>
      </div>
    </div>
  )
}

export default NotFound
