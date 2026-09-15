import { useNavigate } from 'react-router-dom'
import { Globe2, PlayCircle } from 'lucide-react'
import { Button } from './Button'

export function HeroBanner() {
  const navigate = useNavigate()

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1030] via-[#100a20] to-amical-dark px-6 py-10 sm:px-10 sm:py-14">
      {/*
        Fond 100% original (SVG/CSS maison) : pas d'artwork ni de personnage
        Free Fire, pas de logo Garena. Juste des motifs abstraits aux couleurs
        de la marque (amical-orange / amical-accent) pour suggerer l'univers
        "gaming" sans reprendre de propriete intellectuelle tierce.
        Si un visuel officiel/sous licence est fourni par le client plus tard,
        il pourra remplacer ce bloc par une image dans <div className="absolute inset-0" />.
      */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Halos de marque */}
        <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-amical-orange/25 blur-[100px]" />
        <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-amical-accent/20 blur-[100px]" />

        {/* Grille hexagonale, en echo au logo Amical Pay */}
        <svg
          className="absolute inset-0 h-full w-full opacity-[0.06]"
          viewBox="0 0 400 300"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <pattern id="heroHexGrid" width="34" height="30" patternUnits="userSpaceOnUse">
              <polygon
                points="17,1 32,9.5 32,24.5 17,29 2,24.5 2,9.5"
                fill="none"
                stroke="white"
                strokeWidth="0.8"
              />
            </pattern>
          </defs>
          <rect width="400" height="300" fill="url(#heroHexGrid)" />
        </svg>

        {/* Facettes de gemme generiques (motif geometrique, aucun asset de jeu) */}
        <svg
          className="absolute right-8 top-6 h-24 w-24 text-amical-accent/40 sm:h-32 sm:w-32"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <polygon points="50,5 90,35 74,95 26,95 10,35" fill="none" stroke="currentColor" strokeWidth="2" />
          <polygon points="50,5 90,35 50,45 10,35" fill="currentColor" opacity="0.15" />
          <line x1="50" y1="5" x2="50" y2="45" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        </svg>
        <svg
          className="absolute bottom-10 right-28 h-12 w-12 text-amical-orange/50 sm:h-16 sm:w-16"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <polygon points="50,5 90,35 74,95 26,95 10,35" fill="none" stroke="currentColor" strokeWidth="3" />
        </svg>
        <svg
          className="absolute right-56 top-20 hidden h-8 w-8 text-white/20 sm:block"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <polygon points="50,5 90,35 74,95 26,95 10,35" fill="none" stroke="currentColor" strokeWidth="4" />
        </svg>

        {/* Liseret diagonal de marque */}
        <div className="absolute -left-10 top-0 h-full w-24 -skew-x-12 bg-gradient-to-b from-amical-orange/20 via-amical-orange/5 to-transparent" />
      </div>

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
