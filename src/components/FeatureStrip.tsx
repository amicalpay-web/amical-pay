import { ShieldCheck, Zap, Headphones, Flame } from 'lucide-react'

const features = [
  { icon: ShieldCheck, label: 'Paiement sécurisé' },
  { icon: Zap, label: 'Traitement rapide' },
  { icon: Headphones, label: 'Support WhatsApp' },
  { icon: Flame, label: 'Plus de 1000+ produits digitaux pour tous vos besoins gaming !' },
]

export function FeatureStrip() {
  return (
    <div className="grid grid-cols-1 gap-4 border-y border-white/[0.06] bg-amical-dark-secondary/50 px-4 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
      {features.map(({ icon: Icon, label }) => (
        <div key={label} className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amical-orange/15 text-amical-orange">
            <Icon size={18} />
          </div>
          <p className="text-sm text-gray-300">{label}</p>
        </div>
      ))}
    </div>
  )
}

export default FeatureStrip
