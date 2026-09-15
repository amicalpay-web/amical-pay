import { FazerValidationField } from '@/types'
import { apiUrl } from './api'

export interface PlayerValidationResult {
  status: 'success'
  valid: true
  categoryId: string
  playerId?: string | null
  playerName?: string | null
  region?: string | null
}

export interface PlayerValidationRequest {
  categoryId: string
  fields: Record<string, string>
}

export const fazerService = {
  validatePlayer: async (
    request: PlayerValidationRequest
  ): Promise<PlayerValidationResult> => {
    const response = await fetch(apiUrl('/api/fazer/validate-player'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })

    const payload = await response.json().catch(() => ({})) as {
      error?: string
      code?: string
    } & Partial<PlayerValidationResult>

    if (!response.ok || payload.valid !== true) {
      throw new Error(payload.error || `Player validation failed (${response.status})`)
    }

    return payload as PlayerValidationResult
  },
}

export function getValidationFields(productFields?: FazerValidationField[]): FazerValidationField[] {
  if (!Array.isArray(productFields)) return []

  return productFields.map((field) => ({
    ...field,
    key: field.key || field.name,
  }))
}