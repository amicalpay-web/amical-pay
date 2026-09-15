import { useState } from 'react'
import type { ElementType } from 'react'
import { Package } from 'lucide-react'

interface OfferImageProps {
  src?: string
  alt: string
  icon?: ElementType
  className?: string
}

/**
 * Product/category image used across the homepage offer grids.
 *
 * Falls back to a clean icon placeholder when the FazerCards image is
 * missing, invalid, or fails to load, and lazy-loads so a grid of a dozen
 * offers doesn't block the page on remote images that aren't visible yet.
 */
export function OfferImage({ src, alt, icon: Icon = Package, className = '' }: OfferImageProps) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-amical-dark-tertiary text-gray-500 ${className}`}
        role="img"
        aria-label={alt}
      >
        <Icon size={28} />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={`object-cover ${className}`}
      onError={() => setFailed(true)}
    />
  )
}

export default OfferImage
