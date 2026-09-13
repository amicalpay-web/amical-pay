import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button, Card } from '@/components'

function Account() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-amical-dark py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">{t('account.title')}</h1>

        <Card>
          <p className="text-gray-400 mb-6">{t('account.noOrders')}</p>
          <Button className="w-full" onClick={() => navigate('/products')}>
            Commencer à acheter
          </Button>
        </Card>
      </div>
    </div>
  )
}

export default Account
