import { Link } from 'react-router-dom'
import { Flame, ShieldCheck, Truck, Wallet, Headphones, ArrowRight } from 'lucide-react'

const reasons = [
  { icon: ShieldCheck, title: 'Produits officiels', desc: 'FazerCards' },
  { icon: Truck, title: 'Livraison rapide', desc: '(après vérification)' },
  { icon: Wallet, title: 'Paiements sécurisés', desc: 'MonCash & PayPal' },
  { icon: Headphones, title: 'Support WhatsApp', desc: '+509 4388 2372' },
]

export function WhyChooseUs() {
  return (
    <aside className="hidden w-72 shrink-0 space-y-5 xl:block">
      <div className="rounded-2xl border border-white/10 bg-amical-dark-secondary p-5">
        <p className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
          <Flame size={16} className="text-amical-orange" />
          Pourquoi choisir <span className="text-amical-orange">AMICAL PAY</span> ?
        </p>
        <ul className="space-y-4">
          {reasons.map(({ icon: Icon, title, desc }) => (
            <li key={title} className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amical-orange/15 text-amical-orange">
                <Icon size={15} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#241a3a] to-amical-dark p-5">
        <p className="flex items-center gap-1.5 text-sm font-bold text-white">
          <Flame size={15} className="text-amical-orange" />
          Free Fire
        </p>
        <p className="mt-2 text-lg font-black leading-tight text-white">
          Plus qu'un jeu, <span className="text-amical-orange">une communauté !</span>
        </p>
        <Link
          to="/products?category=free_fire_latam"
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-amical-orange px-3.5 py-2 text-xs font-bold text-white transition hover:bg-amical-orange-dark"
        >
          Voir toutes les offres <ArrowRight size={14} />
        </Link>
      </div>
    </aside>
  )
}

export default WhyChooseUs
