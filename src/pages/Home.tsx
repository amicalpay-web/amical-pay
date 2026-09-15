import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components'
import { FazerHomeCatalog } from '@/components/FazerHomeCatalog'

function Home() {
  const navigate = useNavigate()
  const { t } = useTranslation()

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

      {/* Real FazerCards catalog, loaded live - see FazerHomeCatalog */}
      <FazerHomeCatalog />

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-amical-dark-secondary">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            Comment ça marche
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: 1, title: 'Choisir', desc: 'Sélectionnez votre catégorie et votre offre' },
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
    </div>
  )
}

export default Home
