import { useNavigate } from 'react-router-dom'
import { Globe2, PlayCircle } from 'lucide-react'
import { Button } from './Button'

export function HeroBanner() {
  const navigate = useNavigate()

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1030] via-[#100a20] to-amical-dark px-6 py-10 sm:px-10 sm:py-14">
      {/* TODO: remplacer ce fond par le visuel officiel Free Fire fourni par l'utilisateur */}
      <div className="relative z-10 max-w-xl">
        <p className="mb-3 text-4xl font-black italic tracking-tight text-white sm:text-5xl">
          FREE FIRE
        </p>
        <p className="mb-6 text-gray-300">
          Rechargez vos <span className="font-semibold text-white">Diamonds</span>,{' '}
          <span className="font-semibold text-white">Passes</span> et{' '}
          <span className="font-semibold text-white">Abonnements</span> Free Fire rapidement et en toute sécurité.
        </p>

        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-gray-200">
          <Globe2 size={14} />
          Région LATAM
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate('/products?category=free_fire_latam')}>
            Voir les offres →
          </Button>
          <Button
            variant="secondary"
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <span className="flex items-center gap-2">
              <PlayCircle size={18} />
              Comment ça marche
            </span>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default HeroBanner
