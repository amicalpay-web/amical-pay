import { Sidebar, FeatureStrip, CategoryGrid, WhyChooseUs, HeroBanner } from '@/components'
import { FazerHomeCatalog } from '@/components/FazerHomeCatalog'
import { ShieldCheck, Wallet, Clock3 } from 'lucide-react'

function Home() {
  return (
    <div className="min-h-screen bg-amical-dark">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 pt-6 sm:px-6">
        <Sidebar />

        <div className="min-w-0 flex-1">
          <HeroBanner />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/[0.06]">
          <FeatureStrip />
        </div>
      </div>

      {/* Trust & payment strip — signals credibility early, important for a payment site */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mt-4 grid grid-cols-1 gap-3 rounded-2xl border border-white/[0.06] bg-amical-dark-secondary/40 p-4 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amical-accent/15 text-amical-accent">
              <Wallet size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">MonCash & PayPal</p>
              <p className="text-xs text-gray-400">Moyens de paiement acceptés</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amical-orange/15 text-amical-orange">
              <Clock3 size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Livraison rapide</p>
              <p className="text-xs text-gray-400">Après vérification du paiement</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-500/15 text-green-400">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Produits officiels garantis</p>
              <p className="text-xs text-gray-400">Catalogue vérifié et à jour</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-start gap-6 px-4 sm:px-6">
        <div className="hidden w-64 shrink-0 lg:block" aria-hidden="true" />

        <div className="min-w-0 flex-1">
          <CategoryGrid />
        </div>

        <WhyChooseUs />
      </div>

      {/* Live catalog, loaded live - see FazerHomeCatalog */}
      <FazerHomeCatalog />

      {/* How It Works */}
      <section id="how-it-works" className="scroll-mt-24 bg-amical-dark-secondary px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-amical-orange">
              Processus simple
            </p>
            <h2 className="text-3xl font-bold text-white">
              Comment ça marche
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {[
              { step: 1, title: 'Choisir', desc: 'Sélectionnez votre région et votre offre' },
              { step: 2, title: 'Valider', desc: 'Entrez votre Player ID Free Fire' },
              { step: 3, title: 'Payer', desc: 'Effectuez le paiement de manière sécurisée' },
              { step: 4, title: 'Recevoir', desc: 'Recevez vos Diamonds instantanément' },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="rounded-lg bg-amical-dark-tertiary p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amical-orange text-lg font-bold text-white">
                    {item.step}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
                {item.step < 4 && (
                  <div className="absolute -right-3 top-1/2 hidden h-0.5 w-6 bg-amical-orange md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
