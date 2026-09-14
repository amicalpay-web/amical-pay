import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppContext } from '@/contexts/AppContext'
import { Button } from '@/components'
import { regions } from '@/data/regions'

function Home() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { region, setRegion } = useAppContext()

  const handleRegionSelect = (selectedRegion: string) => {
    setRegion(selectedRegion as any)
    navigate('/products')
  }

  return (
    <div className="min-h-screen bg-amical-dark">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 bg-gradient-dark">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            {t('hero.title')}
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/products')}
          >
            {t('hero.cta')}
          </Button>
        </div>
      </section>

      {/* Regions Section */}
      <section className="py-20 px-4 bg-amical-dark">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-2 text-center">
            {t('regions.title')}
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Sélectionnez votre région pour voir les produits disponibles
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {regions.map((reg) => (
              <div
                key={reg.id}
                className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                  region === reg.id
                    ? 'border-amical-orange bg-amical-dark-secondary'
                    : 'border-amical-dark-tertiary hover:border-amical-orange/50'
                }`}
                onClick={() => handleRegionSelect(reg.id)}
              >
                <div className="text-4xl mb-3">{reg.flag}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{reg.name}</h3>
                <p className="text-sm text-gray-400 mb-4">Région sélectionnée</p>
                <Button variant="secondary" size="sm" className="w-full">
                  {t('regions.select')}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-amical-dark-secondary">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            Comment ça marche
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: 1, title: 'Choisir', desc: 'Sélectionnez votre région et votre offre' },
              { step: 2, title: 'Valider', desc: 'Entrez votre Player ID Free Fire' },
              { step: 3, title: 'Payer', desc: 'Effectuez le paiement de manière sécurisée' },
              { step: 4, title: 'Recevoir', desc: 'Recevez vos Diamonds instantanément' },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="bg-amical-dark-tertiary rounded-lg p-6 text-center">
                  <div className="w-12 h-12 bg-amical-orange rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
                {item.step < 4 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-amical-orange"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-amical-dark-tertiary py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="text-lg font-bold text-amical-orange mb-4">Amical Pay</h4>
              <p className="text-gray-400 text-sm">Votre plateforme de confiance pour les Diamonds Free Fire</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-amical-orange">FAQ</a></li>
                <li><a href="#" className="hover:text-amical-orange">Support</a></li>
                <li><a href="#" className="hover:text-amical-orange">Conditions</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <p className="text-gray-400 text-sm">📧 support@amicalpay.com</p>
              <p className="text-gray-400 text-sm">📱 WhatsApp: +50943882372</p>
            </div>
          </div>
          <div className="border-t border-amical-dark-secondary pt-8 text-center text-gray-500 text-sm">
            <p>&copy; 2024 Amical Pay. {t('footer.rights')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
