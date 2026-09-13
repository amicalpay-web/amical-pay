import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Input } from '@/components'
import { useState } from 'react'

function PlayerValidation() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [playerId, setPlayerId] = useState('')

  const handleValidate = () => {
    if (playerId.trim()) {
      // TODO: Call backend validation API
      navigate('/checkout')
    }
  }

  return (
    <div className="min-h-screen bg-amical-dark flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-6">Valider votre Player ID</h1>
        <div className="space-y-4">
          <Input
            placeholder="Entrez votre Player ID"
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            helperText="Vérifiez attentivement votre Player ID"
          />
          <Button className="w-full" onClick={handleValidate}>
            {t('common.continue')}
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => navigate(-1)}>
            {t('common.back')}
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default PlayerValidation
