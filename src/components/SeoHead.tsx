import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'Amical Pay'
const SITE_URL = 'https://amicalpay.com'
const DEFAULT_DESCRIPTION =
  'Rechargez vos Diamonds Free Fire, cartes Steam, PlayStation, Xbox, Roblox et plus, en gourdes (HTG) ou USD. Paiement MonCash/PayPal, livraison rapide, support WhatsApp 24/7.'

interface SeoHeadProps {
  /** Titre de la page, sans le suffixe " | Amical Pay" (ajouté automatiquement) */
  title: string
  description?: string
  /** Chemin relatif utilisé pour construire l'URL canonique, ex: "/products" */
  path?: string
  /** Empêche l'indexation (pages de paiement, compte, etc.) */
  noindex?: boolean
}

/**
 * Titre + description + Open Graph/Twitter par page.
 * Les valeurs globales par défaut vivent dans index.html ; ce composant
 * les surcharge par route via react-helmet-async.
 */
export function SeoHead({ title, description = DEFAULT_DESCRIPTION, path = '/', noindex = false }: SeoHeadProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME
  const canonical = `${SITE_URL}${path}`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  )
}

export default SeoHead
