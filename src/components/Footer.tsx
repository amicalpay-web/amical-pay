import { Link } from 'react-router-dom'
import { Youtube, Instagram, Phone, Mail } from 'lucide-react'
import { FaTiktok, FaWhatsapp } from 'react-icons/fa6'
import logo from '@/assets/logo.svg'

const navLinks = [
  { label: 'Accueil', to: '/' },
  { label: 'Produits', to: '/products' },
  { label: 'Comment ça marche', to: '/#how-it-works' },
  { label: 'Suivre ma commande', to: '/track-order' },
  { label: 'Contact', to: '/support' },
]

const socialLinks = [
  { label: 'YouTube', icon: Youtube, href: 'https://youtube.com/@amicalpay' },
  { label: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/amicalpay' },
  { label: 'TikTok', icon: FaTiktok, href: 'https://www.tiktok.com/@amicalpay' },
  { label: 'WhatsApp Channel', icon: FaWhatsapp, href: 'https://whatsapp.com/channel/0029Vb8jdy2BKfhz0d6GtL1v' },
]

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-amical-dark px-4 py-12 sm:px-6">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <span className="flex items-center gap-2.5">
            <img src={logo} alt="" className="h-9 w-9" />
            <span className="text-sm font-black tracking-[0.2em] text-white">
              AMICAL<span className="text-amical-orange">PAY</span>
            </span>
          </span>
          <p className="mt-3 text-sm text-gray-400">Votre boutique digitale de confiance.</p>
        </div>

        <div>
          <p className="mb-3 text-sm font-bold text-white">Navigation</p>
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="text-sm text-gray-400 transition hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-bold text-white">Nous suivre</p>
          <ul className="space-y-2">
            {socialLinks.map(({ label, icon: Icon, href }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
                >
                  <Icon size={15} />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-bold text-white">Contact</p>
          <ul className="space-y-2">
            <li>
              <a
                href="https://wa.me/50943882372"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
              >
                <Phone size={15} />
                +509 4388 2372
              </a>
            </li>
            <li>
              <a
                href="mailto:support@amicalpay.com"
                className="flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
              >
                <Mail size={15} />
                support@amicalpay.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-2 border-t border-white/[0.06] pt-6 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Amical Pay. Tous droits réservés.</p>
        <div className="flex gap-4">
          <Link to="/products?category=free_fire_latam" className="hover:text-gray-300">Free Fire</Link>
          <Link to="/products" className="hover:text-gray-300">Tous les jeux</Link>
          <Link to="/products" className="hover:text-gray-300">Toutes les plateformes</Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer
