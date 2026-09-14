import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Product } from '@/types'

interface OrderSummaryProps {
  product: Product
  currency: 'USD' | 'HTG'
  playerId: string
  playerIdError?: string
  onContinue?: () => void
  continueLabel?: string
  disabled?: boolean
}

export function OrderSummary({
  product,
  currency,
  playerId,
  playerIdError,
  onContinue,
  continueLabel = 'Continue',
  disabled,
}: OrderSummaryProps) {
  const price = currency === 'USD' ? product.sellingPriceUsd : product.sellingPriceHtg

  return (
    <Card className="border-amical-gold/20 bg-amical-card">
      <h2 className="mb-4 text-xl font-semibold text-white">Order Summary</h2>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-gray-300">
          <span>Game/Service</span>
          <span className="text-white">Free Fire</span>
        </div>
        <div className="flex justify-between text-gray-300">
          <span>Product Type</span>
          <span className="text-white">{product.name}</span>
        </div>
        <div className="flex justify-between text-gray-300">
          <span>Player ID</span>
          <span className="text-white">{playerId || '-'}</span>
        </div>
        {playerIdError && <p className="text-xs text-red-400">{playerIdError}</p>}
        <div className="border-t border-amical-gold/20 pt-3">
          <div className="flex justify-between text-lg font-semibold text-white">
            <span>Total</span>
            <span className="text-amical-gold">
              {currency === 'USD' ? '$' : 'G'} {price.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
      {onContinue && (
        <Button className="mt-6 w-full" onClick={onContinue} disabled={disabled}>
          {continueLabel}
        </Button>
      )}
    </Card>
  )
}
