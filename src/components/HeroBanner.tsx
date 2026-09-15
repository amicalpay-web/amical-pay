import { useNavigate } from 'react-router-dom'
import { PlayCircle, Sparkles } from 'lucide-react'
import { Button } from './Button'

export function HeroBanner() {
  const navigate = useNavigate()

  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate min-h-[24rem] overflow-hidden rounded-2xl border border-white/10 bg-[#08090d] sm:min-h-[34rem]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[url('/amical-pay-hero.webp')] bg-cover bg-center"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/10 to-transparent" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />

      <div className="relative z-10 flex min-h-[24rem] items-end justify-end p-4 sm:min-h-[34rem] sm:p-7 lg:p-9">
        <div className="max-w-sm rounded-2xl border border-white/15 bg-black/55 p-4 shadow-2xl backdrop-blur-md sm:p-5">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-amical-orange/40 bg-amical-orange/15 px-3 py-1 text-xs font-semibold text-orange-100">
            <Sparkles size={13} />
            Recharge Free Fire
          </div>
          <h1 id="hero-title" className="sr-only">Amical Pay — Diamonds Free Fire</h1>
          <p className="text-sm leading-relaxed text-gray-100 sm:text-base">
            Rechargez vos Diamonds, Passes et abonnements rapidement et en toute sécurité.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => navigate('/products?category=free_fire_latam')}>
              Voir les offres →
            </Button>
            <Button
              variant="secondary"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <span className="flex items-center gap-2">
                <PlayCircle size={17} />
                Comment ça marche
              </span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroBanner
