import { useNavigate } from 'react-router-dom'
import { Product } from '@/types'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'

interface ProductCardProps {
  product: Product
  currency: 'USD' | 'HTG'
}

export function ProductCard({ product, currency }: ProductCardProps) {
  const navigate = useNavigate()
  const price = currency === 'USD' ? product.sellingPriceUsd : product.sellingPriceHtg

  return (
    <Card className="flex flex-col justify-between border-amical-gold/20 bg-amical-card">
      <div>
        {product.image ? (
          <img src={product.image} alt={product.name} className="mb-4 h-32 w-full rounded-lg object-cover" />
        ) : (
          <div className="mb-4 flex h-32 items-center justify-center rounded-lg border border-amical-gold/30 bg-amical-dark-soft text-4xl">
            💎
          </div>
        )}
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{product.name}</h3>
          <span className="rounded-full border border-amical-gold/50 px-2 py-0.5 text-xs text-amical-gold">
            {product.region}
          </span>
        </div>
        <p className="text-sm text-gray-300">{product.description}</p>
      </div>
      <div className="mt-4">
        <p className="mb-3 text-2xl font-bold text-amical-gold">
          {currency === 'USD' ? '$' : 'G'} {price.toFixed(2)}
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button variant="secondary" onClick={() => navigate(`/products/${product.id}`)}>
            Details
          </Button>
          <Button onClick={() => navigate(`/checkout?productId=${product.id}`)}>Add to cart</Button>
        </div>
      </div>
    </Card>
  )
}
