import { Card } from '@/components'
import { SeoHead } from '@/components/SeoHead'

function Support() {
  return (
    <div className="min-h-screen bg-amical-dark py-12 px-4">
      <SeoHead
        title="Support & Contact"
        description="Besoin d'aide ? Contactez Amical Pay par email ou WhatsApp (+509 4388 2372), support disponible 24/7."
        path="/support"
      />

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Support</h1>

        <div className="space-y-6">
          <Card>
            <h3 className="text-xl font-semibold text-white mb-4">📧 Email</h3>
            <p className="text-gray-400 mb-4">Envoyez-nous un email et nous vous répondrons dans les 24 heures.</p>
            <a href="mailto:support@amicalpay.com" className="text-amical-orange hover:text-amical-orange-dark">
              support@amicalpay.com
            </a>
          </Card>

          <Card>
            <h3 className="text-xl font-semibold text-white mb-4">📱 WhatsApp</h3>
            <p className="text-gray-400 mb-4">Contactez-nous directement sur WhatsApp pour une aide rapide.</p>
            <a
              href="https://wa.me/50943882372"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amical-orange hover:text-amical-orange-dark"
            >
              +50943882372
            </a>
          </Card>

          <Card>
            <h3 className="text-xl font-semibold text-white mb-4">🕐 Heures d'ouverture</h3>
            <p className="text-gray-400">Nous sommes disponibles 24/7 pour vous aider.</p>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Support
