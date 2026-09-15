import { BadgeCheck, Headphones, Wallet, Clock3 } from 'lucide-react'

const trustPoints = [
  { icon: BadgeCheck, title: 'AmicalPay', desc: 'Votre boutique digitale de confiance.' },
  { icon: Headphones, title: 'Support client', desc: 'Disponible sur WhatsApp : +509 4388 2372' },
  { icon: Wallet, title: 'Paiements disponibles', desc: 'MonCash & PayPal' },
  { icon: Clock3, title: 'Commande simple et rapide', desc: 'Choisissez, payez, recevez en quelques minutes.' },
]

/**
 * Reassurance strip near the bottom of the homepage. Deliberately only
 * states things that are actually true of the business today — no invented
 * certifications or security badges.
 */
export function Trust() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-white/[0.06] bg-amical-dark-secondary/40 p-4 sm:grid-cols-2 lg:grid-cols-4">
        {trustPoints.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amical-orange/15 text-amical-orange">
              <Icon size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{title}</p>
              <p className="text-xs text-gray-400">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Trust
