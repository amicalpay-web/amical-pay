import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/Button'
import { productsService } from '@/services/productsService'
import { useAppContext } from '@/contexts/AppContext'
import { Product } from '@/types'

function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currency } = useAppContext()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Amical Pay - Product'
  }, [])

  useEffect(() => {
    const load = async () => {
      if (!id) return
      const item = await productsService.getProductById(id)
      setProduct(item || null)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <p className="text-gray-300">Loading product...</p>
  if (!product) return <p className="text-gray-300">Product not found.</p>

  const price = currency === 'USD' ? product.sellingPriceUsd : product.sellingPriceHtg

  return (
    <div className="mx-auto max-w-3xl rounded-xl border border-amical-gold/20 bg-amical-card p-6">
      <h1 className="text-3xl font-bold">{product.name}</h1>
      <p className="mt-3 text-gray-300">{product.description}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <span className="rounded-full border border-amical-gold/40 px-3 py-1 text-sm">{product.region}</span>
        <span className="rounded-full border border-amical-gold/40 px-3 py-1 text-sm">
          {currency === 'USD' ? '$' : 'G'} {price.toFixed(2)}
        </span>
      </div>
      <Button className="mt-6" onClick={() => navigate(`/checkout?productId=${product.id}`, { state: { product } })}>
        Continue to checkout
      </Button>
    </div>
  )
}

export default ProductDetail
