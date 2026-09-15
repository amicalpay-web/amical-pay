import { useNavigate } from 'react-router-dom'
import { Globe2, PlayCircle, ShieldCheck, Zap, Sparkles } from 'lucide-react'
import { Button } from './Button'

export function HeroBanner() {
  const navigate = useNavigate()

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1030] via-[#100a20] to-amical-dark px-6 py-10 sm:px-10 sm:py-14">
      {/* Decorative color glows — keeps the hero vivid even without a licensed photo asset */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amical-orange/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 right-10 h-72 w-72 rounded-full bg-amical-accent/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-purple-500/20 blur-3xl"
      />

      <div className="relative z-10 max-w-xl">
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-amical-orange/30 bg-amical-orange/10 px-3 py-1 text-xs font-semibold text-amical-orange">
          <Sparkles size={13} />
          Livraison instantanée 24/7
        </div>

        <p className="mb-3 bg-gradient-to-r from-white via-white to-amical-orange bg-clip-text text-4xl font-black italic tracking-tight text-transparent sm:text-5xl">
          FREE FIRE
        </p>
        <p className="mb-6 text-gray-300">
          Rechargez vos <span className="font-semibold text-white">Diamonds</span>,{' '}
          <span className="font-semibold text-white">Passes</span> et{' '}
          <span className="font-semibold text-white">Abonnements</span> Free Fire rapidement et en toute sécurité.
        </p>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-gray-200">
            <Globe2 size={14} />
            Région LATAM
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-gray-200">
            <ShieldCheck size={14} className="text-amical-accent" />
            Paiement sécurisé
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-gray-200">
            <Zap size={14} className="text-amical-orange" />
            Traitement rapide
          </div>
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
