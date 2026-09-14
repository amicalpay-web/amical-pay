import { useEffect, useState } from 'react'
import { ProductCard } from '@/components/ProductCard'
import { productsService } from '@/services/productsService'
import { useAppContext } from '@/contexts/AppContext'
import { Product, Region } from '@/types'

const regions: Region[] = ['LATAM', 'EU', 'BR', 'MENA']

function HomePage() {
  const { region, setRegion, currency } = useAppContext()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Amical Pay - Free Fire Diamonds'
  }, [])

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await productsService.getProductsByRegion(region)
        setProducts(data)
      } catch {
        setError('Unable to load products right now.')
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [region])

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-amical-gold/20 bg-gradient-main p-8 text-center">
        <h1 className="text-3xl font-bold text-white md:text-5xl">Amical Pay - Free Fire Diamonds</h1>
        <p className="mt-3 text-gray-300">Secure and instant top-ups inspired by FazerCards style.</p>
      </section>

      <section className="flex flex-wrap items-center gap-2">
        {regions.map((regionOption) => (
          <button
            key={regionOption}
            onClick={() => setRegion(regionOption)}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              region === regionOption
                ? 'border-amical-gold bg-amical-gold text-black'
                : 'border-amical-gold/40 text-amical-gold hover:border-amical-gold'
            }`}
          >
            {regionOption}
          </button>
        ))}
      </section>

      {loading && <p className="text-gray-300">Loading products...</p>}
      {error && <p className="rounded-lg border border-red-400/50 bg-red-900/20 p-4 text-red-200">{error}</p>}

      {!loading && !error && (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} currency={currency} />
          ))}
        </section>
      )}
    </div>
  )
}

export default HomePage
