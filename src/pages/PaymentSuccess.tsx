import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Card } from '@/components'

function PaymentSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const status = searchParams.get('status') || 'success'
  const orderNumber = searchParams.get('orderId') || searchParams.get('orderNumber')
  const transactionId = searchParams.get('transactionId')
  const successful = ['success', 'successful', 'completed', 'paid'].includes(status.toLowerCase())

  return (
    <div className="min-h-screen bg-amical-dark flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg text-center">
        <div className="text-6xl mb-4">{successful ? '✅' : '⚠️'}</div>
        <h1 className="text-3xl font-bold text-white mb-3">
          {successful ? 'Paiement reçu' : 'Paiement à vérifier'}
        </h1>
        <p className="text-gray-400 mb-6">
          {successful
            ? 'Merci. Nous vérifions votre paiement MonCash avant de traiter la commande.'
            : 'Votre paiement nécessite une vérification. Nous vous contacterons dès que possible.'}
        </p>

        {orderNumber && (
          <p className="text-white mb-2">
            Commande : <span className="font-semibold">{orderNumber}</span>
          </p>
        )}
        {transactionId && (
          <p className="text-gray-400 text-sm mb-6">
            Transaction : {transactionId}
          </p>
        )}

        <div className="space-y-3 mt-6">
          {orderNumber && (
            <Button
              className="w-full"
              onClick={() => navigate(`/track-order?order=${encodeURIComponent(orderNumber)}`)}
            >
              Suivre ma commande
            </Button>
          )}
          <Button variant="secondary" className="w-full" onClick={() => navigate('/')}>
            Retour à l'accueil
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default PaymentSuccess
