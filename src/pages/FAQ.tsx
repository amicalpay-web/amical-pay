import { useTranslation } from 'react-i18next'
import { Card } from '@/components'

function FAQ() {
  const { t } = useTranslation()

  const faqs = [
    {
      question: 'Comment puis-je acheter des Diamonds?',
      answer: 'Sélectionnez votre région, choisissez un produit, entrez votre Player ID et effectuez le paiement.',
    },
    {
      question: 'Combien de temps pour recevoir les Diamonds?',
      answer: 'Les Diamonds sont généralement livrés dans les 15-30 minutes après confirmation du paiement.',
    },
    {
      question: 'Quelles sont les méthodes de paiement acceptées?',
      answer: 'Nous acceptons MonCash, NatCash et PayPal. Consultez la page de paiement pour les détails.',
    },
    {
      question: 'Puis-je obtenir un remboursement?',
      answer: 'Oui, contactez notre support dans les 24 heures si le produit n\'a pas été reçu.',
    },
  ]

  return (
    <div className="min-h-screen bg-amical-dark py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Questions fréquentes</h1>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <Card key={idx}>
              <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
              <p className="text-gray-400">{faq.answer}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FAQ
