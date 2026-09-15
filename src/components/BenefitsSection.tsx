import { Zap, ShieldCheck, Gamepad2, Headphones } from 'lucide-react'

const benefits = [
  { icon: Zap, title: 'Livraison rapide', desc: 'Vos produits arrivent instantanément après vérification du paiement.' },
  { icon: ShieldCheck, title: 'Paiement sécurisé', desc: 'MonCash et PayPal, avec vérification à chaque commande.' },
  { icon: Gamepad2, title: 'Produits gaming', desc: 'Free Fire, Steam, PlayStation, Xbox, Roblox et bien plus.' },
  { icon: Headphones, title: 'Support client', desc: 'Une équipe disponible sur WhatsApp pour vous accompagner.' },
]

export function BenefitsSection() {
  return (
    <section className="px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-white">Pourquoi choisir AmicalPay</h2>
          <p className="mt-2 text-gray-400">Une expérience d'achat pensée pour les joueurs.</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-amical-dark-tertiary bg-amical-dark-secondary p-5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-amical-orange/15 text-amical-orange">
                <Icon size={20} />
              </div>
              <h3 className="mb-1.5 font-bold text-white">{title}</h3>
              <p className="text-sm text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default BenefitsSection
