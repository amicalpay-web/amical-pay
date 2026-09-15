import { useNavigate } from 'react-router-dom'
import { ArrowRight, Flame, Sparkles } from 'lucide-react'
import { Button } from './Button'

/**
 * The general AmicalPay hero — brand-first, not Free Fire-first. The Free
 * Fire spotlight lives just below in <FeaturedGame />; this section's job is
 * to say what AmicalPay is and get people either browsing the catalog or
 * jumping straight to Free Fire.
 */
export function HeroSection() {
  const navigate = useNavigate()

  const scrollToFreeFire = () => {
    document.getElementById('free-fire')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1030] via-[#100a20] to-amical-dark px-6 py-12 sm:px-10 sm:py-16">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amical-orange/30 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 left-10 h-72 w-72 rounded-full bg-amical-accent/20 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute right-1/3 top-0 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl" />

      <div className="relative z-10 max-w-xl">
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-amical-orange/30 bg-amical-orange/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amical-orange">
          <Sparkles size={13} />
          AmicalPay
        </div>

        <h1 className="mb-4 text-4xl font-black leading-tight text-white sm:text-5xl">
          Vos jeux. <span className="text-amical-orange">Vos offres.</span> Instantanément.
        </h1>

        <p className="mb-8 max-w-md text-gray-300">
          AmicalPay vous permet d'acheter rapidement des recharges et produits numériques pour vos jeux
          préférés — paiement sécurisé, livraison instantanée après vérification.
        </p>

        <div className="flex flex-wrap gap-3">
          <Button size="lg" onClick={() => navigate('/products')}>
            <span className="flex items-center gap-2">
              Explorer le catalogue
              <ArrowRight size={18} />
            </span>
          </Button>
          <Button size="lg" variant="secondary" onClick={scrollToFreeFire}>
            <span className="flex items-center gap-2">
              <Flame size={18} className="text-amical-orange" />
              Free Fire
            </span>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
